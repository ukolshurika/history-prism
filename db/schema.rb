# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_12_23_202832) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "events", force: :cascade do |t|
    t.string "title", null: false
    t.text "description", null: false
    t.integer "category", null: false
    t.bigint "creator_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "gedcom_file_id"
    t.bigint "start_date_id"
    t.bigint "end_date_id"
    t.index ["creator_id"], name: "index_events_on_creator_id"
    t.index ["end_date_id"], name: "index_events_on_end_date_id"
    t.index ["gedcom_file_id"], name: "index_events_on_gedcom_file_id"
    t.index ["start_date_id"], name: "index_events_on_start_date_id"
  end

  create_table "events_people", id: false, force: :cascade do |t|
    t.bigint "event_id", null: false
    t.bigint "person_id", null: false
    t.index ["event_id", "person_id"], name: "index_events_people_on_event_id_and_person_id"
    t.index ["person_id", "event_id"], name: "index_events_people_on_person_id_and_event_id"
  end

  create_table "fuzzy_dates", force: :cascade do |t|
    t.string "original_text", null: false
    t.integer "date_type", default: 0
    t.integer "calendar_type", default: 0
    t.integer "year"
    t.integer "month"
    t.integer "day"
    t.integer "year_end"
    t.integer "month_end"
    t.integer "day_end"
    t.date "earliest_gregorian"
    t.date "latest_gregorian"
    t.date "sort_value"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["sort_value"], name: "index_fuzzy_dates_on_sort_value"
  end

  create_table "gedcom_files", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_gedcom_files_on_user_id"
  end

  create_table "people", force: :cascade do |t|
    t.string "first_name", null: false
    t.string "middle_name"
    t.string "last_name"
    t.string "gedcom_uuid", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "gedcom_file_id"
    t.string "name", null: false
    t.index ["gedcom_file_id"], name: "index_people_on_gedcom_file_id"
    t.index ["gedcom_uuid"], name: "index_people_on_gedcom_uuid", unique: true
    t.index ["user_id"], name: "index_people_on_user_id"
  end

  create_table "sessions", force: :cascade do |t|
    t.bigint "user_id"
    t.string "ip_address"
    t.string "user_agent"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "timelines", force: :cascade do |t|
    t.bigint "person_id", null: false
    t.bigint "user_id", null: false
    t.boolean "visible", default: false, null: false
    t.string "title", null: false
    t.datetime "start_at"
    t.datetime "end_at"
    t.jsonb "event_configuration", default: {}
    t.jsonb "cached_events_for_display", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "pdf_url"
    t.datetime "pdf_generated_at"
    t.index ["end_at"], name: "index_timelines_on_end_at"
    t.index ["pdf_generated_at"], name: "index_timelines_on_pdf_generated_at"
    t.index ["person_id"], name: "index_timelines_on_person_id"
    t.index ["start_at"], name: "index_timelines_on_start_at"
    t.index ["user_id"], name: "index_timelines_on_user_id"
    t.index ["visible"], name: "index_timelines_on_visible"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "events", "fuzzy_dates", column: "end_date_id"
  add_foreign_key "events", "fuzzy_dates", column: "start_date_id"
  add_foreign_key "events", "gedcom_files"
  add_foreign_key "events", "users", column: "creator_id"
  add_foreign_key "gedcom_files", "users"
  add_foreign_key "people", "gedcom_files"
  add_foreign_key "people", "users"
  add_foreign_key "sessions", "users"
  add_foreign_key "timelines", "people"
  add_foreign_key "timelines", "users"
end
