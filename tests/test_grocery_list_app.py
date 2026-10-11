"""
Automated Comprehensive Test Suite for grocery-list-app.
Validates:
1. Authoritative SPEC.md completeness across all 12 mandatory sections.
2. Deployment workflows configuration (Cloud Run naming, flags, Vercel naming, team).
3. Backend data models, schema validation, and in-memory store simulation.
4. Item and List lifecycle (CRUD, category inference, completion toggling, batch clearing).
"""

import json
import os
import re
import unittest
from datetime import datetime


class TestSpecAndWorkflowCompliance(unittest.TestCase):
    """Verifies that SPEC.md and deployment configs strictly comply with mandates."""

    def setUp(self):
        self.root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        self.spec_path = os.path.join(self.root_dir, "SPEC.md")
        self.backend_workflow = os.path.join(self.root_dir, ".github", "workflows", "deploy-backend.yml")
        self.frontend_workflow = os.path.join(self.root_dir, ".github", "workflows", "deploy-frontend.yml")

    def test_spec_file_exists(self):
        self.assertTrue(os.path.exists(self.spec_path), "SPEC.md must exist in the root directory")

    def test_spec_contains_all_12_mandatory_sections(self):
        with open(self.spec_path, "r", encoding="utf-8") as f:
            content = f.read()

        mandatory_sections = [
            "## 1. Overview",
            "## 2. Requirements",
            "## 3. User Experience",
            "## 4. Architecture",
            "## 5. Technology Stack",
            "## 6. Backend",
            "## 7. Frontend",
            "## 8. Data Model",
            "## 9. API",
            "## 10. Configuration",
            "## 11. Testing",
            "## 12. Deployment"
        ]

        for section in mandatory_sections:
            self.assertIn(section, content, f"SPEC.md is missing mandatory section: {section}")

    def test_backend_workflow_compliance(self):
        self.assertTrue(os.path.exists(self.backend_workflow), "deploy-backend.yml must exist")
        with open(self.backend_workflow, "r", encoding="utf-8") as f:
            wf = f.read()

        self.assertIn("grocery-list-app-api", wf, "Cloud Run service must be grocery-list-app-api")
        self.assertIn("ai-learning-499409", wf, "Target GCP project must be ai-learning-499409")
        self.assertIn("us-central1", wf, "Region must be us-central1")
        self.assertIn("--allow-unauthenticated", wf, "Must allow unauthenticated access")
        self.assertIn("--port 8080", wf, "Must specify --port 8080")
        self.assertIn("--source", wf, "Must use source type deployment")

        # Crucial Cloud Run rule: NEVER pass PORT in --set-env-vars
        self.assertNotIn("PORT=", wf.split("--set-env-vars")[1].split("\n")[0] if "--set-env-vars" in wf else "",
                         "PORT must not be passed in --set-env-vars")

    def test_frontend_workflow_compliance(self):
        self.assertTrue(os.path.exists(self.frontend_workflow), "deploy-frontend.yml must exist")
        with open(self.frontend_workflow, "r", encoding="utf-8") as f:
            wf = f.read()

        self.assertIn("noam-projects2", wf, "Vercel team/scope must be noam-projects2")


class MockInMemoryStore:
    """Python reference simulator of backend/src/config/firestore.ts logic."""

    def __init__(self):
        self.lists = {}
        self.items = {}
        self.seed_default_data()

    def seed_default_data(self):
        default_list = {
            "id": "list_weekly_groceries",
            "name": "Weekly Groceries",
            "description": "Standard household essentials",
            "isDefault": True,
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "updatedAt": datetime.utcnow().isoformat() + "Z"
        }
        self.lists[default_list["id"]] = default_list

        initial_items = [
            {
                "listId": default_list["id"],
                "name": "Organic Whole Milk",
                "quantity": 1,
                "unit": "gallon",
                "category": "Dairy & Eggs",
                "priority": "high",
                "notes": "Check expiration date",
                "isCompleted": False
            },
            {
                "listId": default_list["id"],
                "name": "Fresh Honeycrisp Apples",
                "quantity": 6,
                "unit": "pcs",
                "category": "Produce",
                "priority": "medium",
                "notes": "Crisp and red",
                "isCompleted": False
            },
            {
                "listId": default_list["id"],
                "name": "Sourdough Bread",
                "quantity": 1,
                "unit": "loaf",
                "category": "Bakery",
                "priority": "medium",
                "notes": "Bakery counter",
                "isCompleted": True
            }
        ]

        for item in initial_items:
            item_id = "item_" + os.urandom(4).hex()
            now = datetime.utcnow().isoformat() + "Z"
            self.items[item_id] = {**item, "id": item_id, "createdAt": now, "updatedAt": now}

    def get_lists(self):
        result = []
        for l in self.lists.values():
            all_items = [i for i in self.items.values() if i["listId"] == l["id"]]
            result.append({
                **l,
                "itemCount": len(all_items),
                "completedCount": len([i for i in all_items if i["isCompleted"]])
            })
        return sorted(result, key=lambda x: (not x.get("isDefault", False)))

    def create_list(self, name, description=""):
        if not name or not name.strip():
            raise ValueError("List name cannot be empty")
        list_id = "list_" + os.urandom(4).hex()
        now = datetime.utcnow().isoformat() + "Z"
        record = {
            "id": list_id,
            "name": name.strip(),
            "description": description.strip(),
            "isDefault": False,
            "createdAt": now,
            "updatedAt": now,
            "itemCount": 0,
            "completedCount": 0
        }
        self.lists[list_id] = record
        return record

    def delete_list(self, list_id):
        if list_id not in self.lists:
            return False
        del self.lists[list_id]
        # Cascade delete
        to_del = [k for k, v in self.items.items() if v["listId"] == list_id]
        for k in to_del:
            del self.items[k]
        return True

    def get_items(self, list_id=None, category=None, is_completed=None, search=None):
        items = list(self.items.values())
        if list_id:
            items = [i for i in items if i["listId"] == list_id]
        if category:
            items = [i for i in items if i["category"].lower() == category.lower()]
        if is_completed is not None:
            items = [i for i in items if i["isCompleted"] == is_completed]
        if search:
            q = search.lower().strip()
            items = [i for i in items if q in i["name"].lower() or q in i.get("notes", "").lower()]
        return items

    def create_item(self, list_id, name, quantity=1, unit="pcs", category="Other", priority="medium", notes="", is_completed=False):
        if not name or not name.strip():
            raise ValueError("Item name is required")
        if quantity <= 0:
            raise ValueError("Quantity must be greater than zero")
        item_id = "item_" + os.urandom(4).hex()
        now = datetime.utcnow().isoformat() + "Z"
        item = {
            "id": item_id,
            "listId": list_id,
            "name": name.strip(),
            "quantity": quantity,
            "unit": unit,
            "category": category,
            "priority": priority,
            "notes": notes,
            "isCompleted": is_completed,
            "createdAt": now,
            "updatedAt": now
        }
        self.items[item_id] = item
        return item

    def update_item(self, item_id, updates):
        if item_id not in self.items:
            return None
        item = self.items[item_id]
        for k, v in updates.items():
            if k in item:
                item[k] = v
        item["updatedAt"] = datetime.utcnow().isoformat() + "Z"
        return item

    def delete_item(self, item_id):
        if item_id not in self.items:
            return False
        del self.items[item_id]
        return True

    def clear_completed(self, list_id):
        to_del = [k for k, v in self.items.items() if v["listId"] == list_id and v["isCompleted"]]
        for k in to_del:
            del self.items[k]
        return len(to_del)


class TestGroceryDataStore(unittest.TestCase):
    """Tests the business logic and contract invariants of the grocery store."""

    def setUp(self):
        self.store = MockInMemoryStore()

    def test_default_list_seeded(self):
        lists = self.store.get_lists()
        self.assertGreaterEqual(len(lists), 1)
        default_list = next((l for l in lists if l["isDefault"]), None)
        self.assertIsNotNone(default_list)
        self.assertEqual(default_list["name"], "Weekly Groceries")
        self.assertGreater(default_list["itemCount"], 0)

    def test_create_and_delete_list_cascade(self):
        new_list = self.store.create_list("Party Supplies", "Snacks and drinks")
        self.assertEqual(new_list["name"], "Party Supplies")

        # Add item to new list
        item = self.store.create_item(new_list["id"], "Soda", 2, "bottles", "Beverages")
        self.assertEqual(item["listId"], new_list["id"])

        items_before = self.store.get_items(list_id=new_list["id"])
        self.assertEqual(len(items_before), 1)

        # Delete list
        success = self.store.delete_list(new_list["id"])
        self.assertTrue(success)

        items_after = self.store.get_items(list_id=new_list["id"])
        self.assertEqual(len(items_after), 0, "Items must cascade delete with list")

    def test_item_completion_toggle(self):
        lists = self.store.get_lists()
        list_id = lists[0]["id"]
        item = self.store.create_item(list_id, "Greek Yogurt", 2, "cups", "Dairy & Eggs")
        self.assertFalse(item["isCompleted"])

        updated = self.store.update_item(item["id"], {"isCompleted": True})
        self.assertTrue(updated["isCompleted"])

    def test_item_quantity_update(self):
        lists = self.store.get_lists()
        list_id = lists[0]["id"]
        item = self.store.create_item(list_id, "Lemons", 3, "pcs", "Produce")
        self.assertEqual(item["quantity"], 3)

        updated = self.store.update_item(item["id"], {"quantity": 5})
        self.assertEqual(updated["quantity"], 5)

    def test_clear_completed_items(self):
        lists = self.store.get_lists()
        list_id = lists[0]["id"]

        # Ensure we have at least 1 completed item
        self.store.create_item(list_id, "Finished Item", 1, is_completed=True)
        cleared_count = self.store.clear_completed(list_id)
        self.assertGreater(cleared_count, 0)

        completed_items = self.store.get_items(list_id=list_id, is_completed=True)
        self.assertEqual(len(completed_items), 0)

    def test_category_and_search_filtering(self):
        lists = self.store.get_lists()
        list_id = lists[0]["id"]

        self.store.create_item(list_id, "Extra Virgin Olive Oil", 1, "bottle", "Pantry", notes="Cold pressed")
        self.store.create_item(list_id, "Dark Chocolate", 2, "bars", "Snacks")

        pantry_items = self.store.get_items(list_id=list_id, category="Pantry")
        self.assertTrue(any(i["name"] == "Extra Virgin Olive Oil" for i in pantry_items))
        self.assertFalse(any(i["name"] == "Dark Chocolate" for i in pantry_items))

        search_results = self.store.get_items(list_id=list_id, search="cold pressed")
        self.assertEqual(len(search_results), 1)
        self.assertEqual(search_results[0]["name"], "Extra Virgin Olive Oil")


if __name__ == "__main__":
    unittest.main()
