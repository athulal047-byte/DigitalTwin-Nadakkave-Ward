# Database Schema & Structure

The Nadakkave Ward Digital Twin relies on a highly relational PostgreSQL 17 database. 
An active scan of the live `nadakkave` database reveals exactly **113 tables**, encompassing every domain of municipal management, spatial PostGIS tracking, and digital twin state synchronization.

## Core Modules & Table Inventory

The schema is categorized into the following enterprise domains:

### 1. Spatial & Digital Twin Core
Manages the real-time interaction between Unreal Engine 5 and the database.
*   **PostGIS Data:** `spatial_base_data`, `spatial_ref_sys`, `geometry_columns`, `geography_columns`, `gis_layers`
*   **State & Sync:** `digital_twin_sessions`, `digital_twin_state`, `command_queue`, `dead_letter_commands`, `event_bus`, `processed_events`
*   **Simulations & AI:** `simulation_runs`, `simulation_results`, `simulation_scenarios`, `ai_predictions`, `ai_recommendations`, `prediction_jobs`

### 2. Smart City Infrastructure
The physical assets that exist in the physical and virtual world.
*   **Utilities:** `water_supply`, `water_pipelines`, `sewerage`, `solid_waste`, `stormwater_drainage`, `electricity`, `electric_transformers`, `telecom`
*   **Built Environment:** `buildings`, `building_owners`, `building_history`, `building_tax`, `roads`, `social_infrastructure`, `assets`
*   **Sensors (IoT):** `sensors`, `sensor_types`, `sensor_readings`, `sensor_alerts`

### 3. Municipal Administration & RBAC
Controls access, performance tracking, and document handling.
*   **Administration:** `departments`, `department_budgets`, `governance`, `economic_activity`, `environment`, `disaster_management`
*   **Role-Based Access Control:** `users`, `roles`, `permissions`, `role_permissions`, `sessions`, `user_preferences`
*   **Administrative Dashboards:** `admin_ward_summary`, `admin_todays_summary`, `admin_city_health_metrics`, `admin_department_performance`, `admin_infrastructure_health`, `dashboard_layouts`, `dashboard_widgets`, `widget_permissions`
*   **File Management:** `documents`, `document_versions`, `document_permissions`, `attachments`, `storage_files`, `storage_providers`

### 4. Citizen Portal
Citizen-facing applications, profiling, and interaction.
*   **Demographics:** `citizen_profiles`, `family_members`, `demographics`
*   **Properties & Billing:** `citizen_properties`, `property_assessments`, `property_ownership_history`, `tenants`, `tax_invoices`, `utility_bills`, `utility_connections`, `payments`, `payment_items`
*   **Interactions:** `citizen_applications`, `grievances`, `grievance_comments`, `comments`, `alerts`, `alert_acknowledgements`, `notifications`, `notification_reads`

### 5. Enterprise Work Orders (CMMS)
Tracks repairs, inspections, and logistics.
*   **Work Orders:** `work_orders`, `work_order_history`, `work_order_costs`, `work_order_types`
*   **Status & Logistics:** `workflow_status`, `workflow_transitions`, `approvals`, `materials`, `material_inventory`, `material_usage`, `labour_logs`, `meter_readings`
*   **Inspections:** `inspections`, `inspection_results`, `inspection_templates`, `inspection_template_items`, `failure_codes`, `repair_codes`, `root_cause_codes`, `maintenance_plans`, `maintenance_schedule`, `sla_policies`

*(Note: Raw SQL schemas and migration files are located in the `database/` directory).*
