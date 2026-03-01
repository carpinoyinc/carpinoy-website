-- Carpinoy Car Loan Applications Table
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS carloan_applications (
  id            BIGSERIAL PRIMARY KEY,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  status        TEXT NOT NULL DEFAULT 'pending',
  sales_agent   TEXT DEFAULT '',
  remarks       TEXT DEFAULT '',
  unit_applying TEXT NOT NULL,
  unit_applied  TEXT DEFAULT '',
  mitsubishi_data_privacy_act  BOOLEAN DEFAULT false,
  isuzu_data_privacy_act       BOOLEAN DEFAULT false,
  toyota_data_privacy_act      BOOLEAN DEFAULT false,
  hyundai_data_privacy_act     BOOLEAN DEFAULT false,
  kia_data_privacy_act         BOOLEAN DEFAULT false,
  hino_data_privacy_act        BOOLEAN DEFAULT false,
  principal_firstname          TEXT NOT NULL,
  principal_middlename         TEXT DEFAULT '',
  principal_lastname           TEXT NOT NULL,
  principal_birthday           DATE,
  principal_age                TEXT DEFAULT '',
  principal_civil_status       TEXT DEFAULT '',
  principal_nationality        TEXT DEFAULT 'Filipino',
  principal_gender             TEXT DEFAULT '',
  principal_tin                TEXT DEFAULT '',
  principal_home_address       TEXT DEFAULT '',
  principal_residential_status TEXT DEFAULT '',
  principal_residential_years_live TEXT DEFAULT '',
  principal_homephone_number   TEXT DEFAULT '',
  principal_mobilephone_number TEXT NOT NULL,
  principal_secondary_mobilephone TEXT DEFAULT '',
  principal_email_address      TEXT DEFAULT '',
  principal_facebook_profile_link TEXT DEFAULT '',
  principal_main_bank          TEXT DEFAULT '',
  principal_mothers_maiden_name TEXT DEFAULT '',
  principal_birth_place        TEXT DEFAULT '',
  principal_job_business_status TEXT DEFAULT '',
  principal_employer_name      TEXT DEFAULT '',
  principal_job_description    TEXT DEFAULT '',
  principal_job_tenure         TEXT DEFAULT '',
  principal_monthly_income     TEXT DEFAULT '',
  principal_nature_job_business TEXT DEFAULT '',
  principal_job_business_email TEXT DEFAULT '',
  principal_job_business_phone_number TEXT DEFAULT '',
  comaker_firstname            TEXT DEFAULT '',
  comaker_middlename           TEXT DEFAULT '',
  comaker_lastname             TEXT DEFAULT '',
  comaker_gender               TEXT DEFAULT '',
  comaker_relation_to_principal TEXT DEFAULT '',
  comaker_tin                  TEXT DEFAULT '',
  comaker_birth_place          TEXT DEFAULT '',
  comaker_mobile_number        TEXT DEFAULT '',
  comaker_email_address        TEXT DEFAULT '',
  comaker_job_business_status  TEXT DEFAULT '',
  comaker_job_business_name    TEXT DEFAULT '',
  comaker_job_description      TEXT DEFAULT '',
  comaker_job_business_tenure  TEXT DEFAULT '',
  comaker_monthly_income       TEXT DEFAULT '',
  comaker_job_business_nature  TEXT DEFAULT '',
  comaker_job_business_email   TEXT DEFAULT '',
  comaker_job_business_phone_number TEXT DEFAULT '',
  principal_reference_name_mobile_address_first  TEXT DEFAULT '',
  principal_reference_name_mobile_address_second TEXT DEFAULT '',
  principal_reference_name_mobile_address_third  TEXT DEFAULT ''
);

ALTER TABLE carloan_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON carloan_applications
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated read" ON carloan_applications
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated update" ON carloan_applications
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_carloan_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER carloan_updated_at
  BEFORE UPDATE ON carloan_applications
  FOR EACH ROW EXECUTE FUNCTION update_carloan_updated_at();

CREATE INDEX idx_carloan_status ON carloan_applications(status);
CREATE INDEX idx_carloan_created ON carloan_applications(created_at DESC);
