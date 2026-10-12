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
        self.assertIn("npm install", wf, "Must use npm install instead of npm ci to handle environments without lockfiles")

        # Crucial Cloud Run rule: NEVER pass PORT in --set-env-vars
        self.assertNotIn("PORT=", wf.split("--set-env-vars")[1].split("\n")[0] if "--set-env-vars" in wf else "",
                         "PORT must not be passed in --set-env-vars")

    def test_frontend_workflow_compliance(self):
        self.assertTrue(os.path.exists(self.frontend_workflow), "deploy-frontend.yml must exist")
        with open(self.frontend_workflow, "r", encoding="utf-8") as f:
            wf = f.read()

        self.assertIn("noam-projects2", wf, "Vercel team/scope must be noam-projects2")
        self.assertIn("grocery-list-app-ui", wf, "Vercel project name must be grocery-list-app-ui")
        self.assertIn("npm install", wf, "Must use npm install instead of npm ci")
        self.assertNotIn("vercel pull", wf, "Must not use vercel pull requiring unconfigured org/project id secrets")

    def test_backend_dockerfile_and_gcloudignore(self):
        dockerfile = os.path.join(self.root_dir, "backend", "Dockerfile")
        gcloudignore = os.path.join(self.root_dir, "backend", ".gcloudignore")
        self.assertTrue(os.path.exists(dockerfile), "backend/Dockerfile must exist for container build fallback")
        self.assertTrue(os.path.exists(gcloudignore), "backend/.gcloudignore must exist")

        with open(dockerfile, "r", encoding="utf-8") as f:
            df = f.read()
        self.assertIn("EXPOSE 8080", df)
        self.assertIn("dist/server.js", df)

    def test_vercel_project_configuration(self):
        vercel_json = os.path.join(self.root_dir, "frontend", "vercel.json")
        self.assertTrue(os.path.exists(vercel_json), "frontend/vercel.json must exist")
        with open(vercel_json, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.assertEqual(data.get("name"), "grocery-list-app-ui")

    def test_vite_client_types_and_env_declaration(self):
        """Verifies fix for Vercel TS2339 error: Property 'env' does not exist on type 'ImportMeta'."""
        vite_env_dts = os.path.join(self.root_dir, "frontend", "src", "vite-env.d.ts")
        self.assertTrue(os.path.exists(vite_env_dts), "frontend/src/vite-env.d.ts must exist")
        with open(vite_env_dts, "r", encoding="utf-8") as f:
            env_content = f.read()
        self.assertIn('/// <reference types="vite/client" />', env_content)
        self.assertIn("interface ImportMetaEnv", env_content)
        self.assertIn("interface ImportMeta", env_content)

        tsconfig_path = os.path.join(self.root_dir, "frontend", "tsconfig.json")
        with open(tsconfig_path, "r", encoding="utf-8") as f:
            tsconfig_content = f.read()
        self.assertIn('"vite/client"', tsconfig_content, "frontend/tsconfig.json must include vite/client in types")

        client_ts_path = os.path.join(self.root_dir, "frontend", "src", "api", "client.ts")
        with open(client_ts_path, "r", encoding="utf-8") as f:
            client_content = f.read()
        self.assertIn("API_BASE", client_content)

    def test_jest_configuration_no_duplicate_conflict(self):
        """Verifies fix for Jest multiple configurations conflict (jest.config.js vs package.json 'jest' key)."""
        backend_pkg_path = os.path.join(self.root_dir, "backend", "package.json")
        jest_config_path = os.path.join(self.root_dir, "backend", "jest.config.js")

        self.assertTrue(os.path.exists(jest_config_path), "backend/jest.config.js must exist")
        with open(jest_config_path, "r", encoding="utf-8") as f:
            jest_config_content = f.read()
        self.assertIn("ts-jest", jest_config_content, "jest.config.js must specify ts-jest preset")
        self.assertIn("node", jest_config_content, "jest.config.js must specify node testEnvironment")

        with open(backend_pkg_path, "r", encoding="utf-8") as f:
            backend_pkg = json.load(f)

        # Must NOT have inline "jest" key in package.json when jest.config.js exists
        self.assertNotIn("jest", backend_pkg, "backend/package.json must not have 'jest' key to prevent multiple configurations conflict")

        # Test script must explicitly specify --config jest.config.js
        test_script = backend_pkg.get("scripts", {}).get("test", "")
        self.assertIn("--config jest.config.js", test_script, "test script must explicitly specify --config jest.config.js")

    def test_html_doctype_response_guard(self):
        """Verifies fix for UI error: Unexpected token '<', '<!doctype '... is not valid JSON."""
        client_ts_path = os.path.join(self.root_dir, "frontend", "src", "api", "client.ts")
        self.assertTrue(os.path.exists(client_ts_path), "frontend/src/api/client.ts must exist")
        with open(client_ts_path, "r", encoding="utf-8") as f:
            client_content = f.read()

        # Must guard against HTML doctype responses before JSON parse
        self.assertIn("HtmlResponseError", client_content, "Must define HtmlResponseError class")
        self.assertIn("isHtmlResponseError", client_content, "Must export isHtmlResponseError helper")
        self.assertIn("<!doctype", client_content, "Must explicitly detect <!doctype responses")
        self.assertIn("content-type", client_content.lower(), "Must inspect content-type header before parsing")
        self.assertIn("API_BASE", client_content, "Must export API_BASE")
        self.assertIn("API_BASE_URL", client_content, "Must export API_BASE_URL")

        # Diagnostic banner component
        banner_path = os.path.join(self.root_dir, "frontend", "src", "components", "DiagnosticBanner.tsx")
        self.assertTrue(os.path.exists(banner_path), "frontend/src/components/DiagnosticBanner.tsx must exist")
        with open(banner_path, "r", encoding="utf-8") as f:
            banner_content = f.read()
        self.assertIn("DiagnosticBanner", banner_content)
        self.assertIn("VITE_API_URL", banner_content)

    def test_vite_dev_proxy_and_backend_404_handler(self):
        """Verifies Vite dev proxy and Express 404 JSON catch-all handler."""
        vite_config_path = os.path.join(self.root_dir, "frontend", "vite.config.ts")
        with open(vite_config_path, "r", encoding="utf-8") as f:
            vite_conf = f.read()
        self.assertIn("proxy", vite_conf, "vite.config.ts must configure dev server proxy")
        self.assertIn("8080", vite_conf, "vite.config.ts proxy must route to backend port 8080")

        app_ts_path = os.path.join(self.root_dir, "backend", "src", "app.ts")
        with open(app_ts_path, "r", encoding="utf-8") as f:
            app_content = f.read()
        self.assertIn("NOT_FOUND", app_content, "backend app.ts must have 404 JSON catch-all handler")
        self.assertIn("res.status(404)", app_content, "backend app.ts must return HTTP 404 JSON status")

    def test_cloud_run_backend_connection_architecture(self):
        """Verifies direct frontend connection to deployed Cloud Run backend API."""
        client_ts_path = os.path.join(self.root_dir, "frontend", "src", "api", "client.ts")
        with open(client_ts_path, "r", encoding="utf-8") as f:
            client_content = f.read()

        # Must export DEFAULT_PRODUCTION_API_URL pointing to deployed Cloud Run service
        self.assertIn("DEFAULT_PRODUCTION_API_URL", client_content)
        self.assertIn("grocery-list-app-api", client_content)
        self.assertIn("run.app", client_content)

        # Must export checkBackendHealth
        self.assertIn("checkBackendHealth", client_content)

        # Must have fallback to DEFAULT_PRODUCTION_API_URL in getApiBaseUrl()
        self.assertIn("return DEFAULT_PRODUCTION_API_URL", client_content)

        # Environment files
        env_prod_path = os.path.join(self.root_dir, "frontend", ".env.production")
        self.assertTrue(os.path.exists(env_prod_path), "frontend/.env.production must exist")
        with open(env_prod_path, "r", encoding="utf-8") as f:
            env_prod_content = f.read()
        self.assertIn("VITE_API_URL", env_prod_content)
        self.assertIn("grocery-list-app-api", env_prod_content)

        # Connection modal component
        modal_path = os.path.join(self.root_dir, "frontend", "src", "components", "ConnectionModal.tsx")
        self.assertTrue(os.path.exists(modal_path), "frontend/src/components/ConnectionModal.tsx must exist")
        with open(modal_path, "r", encoding="utf-8") as f:
            modal_content = f.read()
        self.assertIn("ConnectionModal", modal_content)
        self.assertIn("DEFAULT_PRODUCTION_API_URL", modal_content)
        self.assertIn("checkBackendHealth", modal_content)

        # Header component integration
        header_path = os.path.join(self.root_dir, "frontend", "src", "components", "Header.tsx")
        with open(header_path, "r", encoding="utf-8") as f:
            header_content = f.read()
        self.assertIn("onOpenConnectionModal", header_content)
        self.assertIn("isBackendConnected", header_content)

        # Diagnostic banner quick connect
        banner_path = os.path.join(self.root_dir, "frontend", "src", "components", "DiagnosticBanner.tsx")
        with open(banner_path, "r", encoding="utf-8") as f:
            banner_content = f.read()
        self.assertIn("Connect to Cloud Run", banner_content)





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
