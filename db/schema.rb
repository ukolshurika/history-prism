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

ActiveRecord::Schema[8.0].define(version: 2026_03_27_000200) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "_yoyo_log", id: { type: :string, limit: 36 }, force: :cascade do |t|
    t.string "migration_hash", limit: 64
    t.string "migration_id", limit: 255
    t.string "operation", limit: 10
    t.string "username", limit: 255
    t.string "hostname", limit: 255
    t.string "comment", limit: 255
    t.datetime "created_at_utc", precision: nil
  end

  create_table "_yoyo_migration", primary_key: "migration_hash", id: { type: :string, limit: 64 }, force: :cascade do |t|
    t.string "migration_id", limit: 255
    t.datetime "applied_at_utc", precision: nil
  end

  create_table "_yoyo_version", primary_key: "version", id: :integer, default: nil, force: :cascade do |t|
    t.datetime "installed_at_utc", precision: nil
  end

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

  create_table "books", force: :cascade do |t|
    t.bigint "creator_id", null: false
    t.string "name"
    t.string "location"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.decimal "latitude", precision: 10, scale: 6
    t.decimal "longitude", precision: 10, scale: 6
    t.index ["creator_id"], name: "index_books_on_creator_id"
  end

  create_table "events", force: :cascade do |t|
    t.string "title", null: false
    t.text "description", null: false
    t.integer "category", null: false
    t.bigint "creator_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "start_date_id"
    t.bigint "end_date_id"
    t.string "source_type"
    t.bigint "source_id"
    t.integer "page_number"
    t.bigint "location_id"
    t.index ["category"], name: "index_events_on_category"
    t.index ["creator_id"], name: "index_events_on_creator_id"
    t.index ["end_date_id"], name: "index_events_on_end_date_id"
    t.index ["location_id"], name: "index_events_on_location_id"
    t.index ["source_type", "source_id", "page_number"], name: "index_events_on_source_and_page_number"
    t.index ["source_type", "source_id"], name: "index_events_on_source_type_and_source_id"
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
    t.index ["year"], name: "index_fuzzy_dates_on_year"
  end

  create_table "gedcom_files", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_gedcom_files_on_user_id"
  end

  create_table "locations", force: :cascade do |t|
    t.string "place", null: false
    t.decimal "latitude", precision: 10, scale: 6
    t.decimal "longitude", precision: 10, scale: 6
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["place"], name: "index_locations_on_place"
  end

  create_table "page_processing_cache", force: :cascade do |t|
    t.text "blob_key", null: false
    t.integer "page_number", null: false
    t.integer "book_id", null: false
    t.text "page_text"
    t.jsonb "events"
    t.text "status", default: "text_ready", null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.index ["blob_key"], name: "idx_page_cache_blob_key"
    t.index ["book_id"], name: "idx_page_cache_book_id"
    t.index ["created_at"], name: "idx_page_cache_created_at"
    t.index ["status"], name: "idx_page_cache_status"
    t.unique_constraint ["blob_key", "page_number"], name: "uq_page_cache_blob_page"
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
    t.index ["first_name", "last_name"], name: "index_people_on_first_name_and_last_name"
    t.index ["gedcom_file_id"], name: "index_people_on_gedcom_file_id"
    t.index ["gedcom_uuid", "gedcom_file_id"], name: "index_people_on_gedcom_uuid_and_gedcom_file_id", unique: true
    t.index ["user_id"], name: "index_people_on_user_id"
  end

  create_table "sessions", force: :cascade do |t|
    t.bigint "user_id", null: false
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
    t.string "email_confirmation_token"
    t.datetime "confirmed_at"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["email_confirmation_token"], name: "index_users_on_email_confirmation_token", unique: true
  end

  create_table "yoyo_lock", primary_key: "locked", id: :integer, default: 1, force: :cascade do |t|
    t.datetime "ctime", precision: nil
    t.integer "pid", null: false
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "books", "users", column: "creator_id"
  add_foreign_key "events", "fuzzy_dates", column: "end_date_id"
  add_foreign_key "events", "fuzzy_dates", column: "start_date_id"
  add_foreign_key "events", "locations"
  add_foreign_key "events", "users", column: "creator_id"
  add_foreign_key "gedcom_files", "users"
  add_foreign_key "people", "gedcom_files"
  add_foreign_key "people", "users"
  add_foreign_key "sessions", "users"
  add_foreign_key "timelines", "people"
  add_foreign_key "timelines", "users"
end
