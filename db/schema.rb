# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_09_06_001823) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "hstore"
  enable_extension "plpgsql"

  create_table "accountmaps", id: :serial, force: :cascade do |t|
    t.string "account"
    t.string "ctype"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "accounts", id: :serial, force: :cascade do |t|
    t.string "account"
    t.string "atype"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "closed"
  end

  create_table "categories", id: :serial, force: :cascade do |t|
    t.string "ctype"
    t.string "category"
    t.string "subcategory"
    t.string "tax"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "inputs", id: :serial, force: :cascade do |t|
    t.date "date"
    t.string "pm"
    t.string "checkno"
    t.string "what"
    t.decimal "amount"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "investment_maps", id: :serial, force: :cascade do |t|
    t.integer "account_id"
    t.integer "summary_type_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "investments", id: :serial, force: :cascade do |t|
    t.integer "account_id"
    t.date "date"
    t.decimal "value"
    t.decimal "shares"
    t.decimal "pershare"
    t.decimal "guaranteed"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "items", id: :serial, force: :cascade do |t|
    t.date "date"
    t.string "pm"
    t.string "checkno"
    t.integer "what_id"
    t.decimal "amount"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "permissions", id: :serial, force: :cascade do |t|
    t.integer "user_id"
    t.string "pkey"
    t.hstore "pvalue"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "rebalance_maps", id: :serial, force: :cascade do |t|
    t.integer "rebalance_type_id"
    t.integer "account_id"
    t.decimal "target"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "rebalance_types", id: :serial, force: :cascade do |t|
    t.string "rtype"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "summary_types", id: :serial, force: :cascade do |t|
    t.string "stype"
    t.integer "priority"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", id: :serial, force: :cascade do |t|
    t.string "signin"
    t.string "password_digest"
    t.string "remember_token"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "what_maps", id: :serial, force: :cascade do |t|
    t.string "whatmap"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "what_id"
  end

  create_table "whats", id: :serial, force: :cascade do |t|
    t.string "what"
    t.integer "category_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

end
