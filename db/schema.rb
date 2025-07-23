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

ActiveRecord::Schema[8.0].define(version: 2025_07_22_123111) do
  create_table "brands", charset: "utf8mb3", force: :cascade do |t|
    t.string "name", null: false
    t.string "callback"
    t.string "secret", null: false
    t.string "token", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_brands_on_name"
  end

  create_table "brands_sprints", charset: "utf8mb3", force: :cascade do |t|
    t.bigint "brands_id"
    t.bigint "sprint_id"
    t.datetime "completed_at"
    t.datetime "delivery_at"
    t.integer "external_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["brands_id"], name: "index_brands_sprints_on_brands_id"
    t.index ["sprint_id"], name: "index_brands_sprints_on_sprint_id"
  end

  create_table "casino_games", charset: "utf8mb3", force: :cascade do |t|
    t.string "source_id", null: false
    t.string "code", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["code"], name: "index_casino_games_on_code"
    t.index ["source_id"], name: "index_casino_games_on_source_id"
  end

  create_table "prizes", charset: "utf8mb3", force: :cascade do |t|
    t.string "owner_type", null: false
    t.bigint "owner_id", null: false
    t.integer "places_from", null: false
    t.integer "places_to", null: false
    t.string "award_type", null: false
    t.string "award_value", limit: 1024, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["owner_type", "owner_id"], name: "index_promo_prizes_on_owner_type_and_owner_id"
  end

  create_table "sprint_attempts", charset: "utf8mb3", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "sprint_id", null: false
    t.bigint "brand_id", null: false
    t.bigint "external_id", null: false
    t.decimal "score", precision: 14, scale: 2, default: "0.0", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["brand_id"], name: "index_sprint_attempts_on_brand_id"
    t.index ["sprint_id"], name: "index_sprint_attempts_on_sprint_id"
  end

  create_table "sprint_vendors", charset: "utf8mb3", force: :cascade do |t|
    t.integer "sprint_id"
    t.string "vendor", limit: 32, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["sprint_id"], name: "index_sprint_vendors_on_sprint_id"
  end

  create_table "sprints", charset: "utf8mb3", force: :cascade do |t|
    t.string "title", null: false
    t.datetime "starts_at", null: false
    t.datetime "ends_at", null: false
    t.string "scoring_mode", null: false
    t.integer "spins_to_qualify", default: 100, null: false
    t.string "bet_limit"
    t.datetime "completed_at"
    t.integer "spins_to_reset", default: 25, null: false
    t.string "game_source", limit: 16, default: "list", null: false
    t.string "game_tag", default: "slot"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["completed_at"], name: "index_sprints_on_completed_at"
    t.index ["starts_at", "ends_at"], name: "index_sprints_on_starts_at_and_ends_at"
  end
end
