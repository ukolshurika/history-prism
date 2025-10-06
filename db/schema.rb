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

ActiveRecord::Schema[8.0].define(version: 2025_10_06_000004) do
  create_table "events", charset: "utf8mb3", force: :cascade do |t|
    t.string "title", null: false
    t.text "description", null: false
    t.datetime "start_date", precision: nil, null: false
    t.datetime "end_date", precision: nil, null: false
    t.integer "category", null: false
    t.bigint "creator_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["creator_id"], name: "index_events_on_creator_id"
  end

  create_table "events_people", id: false, charset: "utf8mb3", force: :cascade do |t|
    t.bigint "event_id", null: false
    t.bigint "person_id", null: false
    t.index ["event_id", "person_id"], name: "index_events_people_on_event_id_and_person_id"
    t.index ["person_id", "event_id"], name: "index_events_people_on_person_id_and_event_id"
  end

  create_table "people", charset: "utf8mb3", force: :cascade do |t|
    t.string "first_name", null: false
    t.string "middle_name"
    t.string "last_name"
    t.string "gedcom_uuid", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["gedcom_uuid"], name: "index_people_on_gedcom_uuid", unique: true
    t.index ["user_id"], name: "index_people_on_user_id"
  end

  create_table "sessions", charset: "utf8mb3", force: :cascade do |t|
    t.bigint "user_id"
    t.string "ip_address"
    t.string "user_agent"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "users", charset: "utf8mb3", force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "events", "users", column: "creator_id"
  add_foreign_key "people", "users"
  add_foreign_key "sessions", "users"
end
