# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20170217201916) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "hstore"

  create_table "accountmaps", force: :cascade do |t|
    t.string   "account"
    t.string   "ctype"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "accounts", force: :cascade do |t|
    t.string   "account"
    t.string   "atype"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "categories", force: :cascade do |t|
    t.string   "ctype"
    t.string   "category"
    t.string   "subcategory"
    t.string   "tax"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  create_table "conversations", force: :cascade do |t|
    t.integer  "person_id"
    t.date     "date"
    t.text     "note"
    t.date     "scheduled"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "inputs", force: :cascade do |t|
    t.date     "date"
    t.string   "pm"
    t.string   "checkno"
    t.string   "what"
    t.decimal  "amount"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "investment_maps", force: :cascade do |t|
    t.integer  "account_id"
    t.integer  "summary_type_id"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
  end

  create_table "investments", force: :cascade do |t|
    t.integer  "account_id"
    t.date     "date"
    t.decimal  "value"
    t.decimal  "shares"
    t.decimal  "pershare"
    t.decimal  "guaranteed"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "items", force: :cascade do |t|
    t.date     "date"
    t.string   "pm"
    t.string   "checkno"
    t.integer  "what_id"
    t.decimal  "amount"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "jiras", force: :cascade do |t|
    t.string   "summary"
    t.string   "status"
    t.string   "description"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.integer  "priority"
  end

  create_table "people", force: :cascade do |t|
    t.integer  "user_id"
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "permissions", force: :cascade do |t|
    t.integer  "user_id"
    t.string   "pkey"
    t.hstore   "pvalue"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "rebalance_maps", force: :cascade do |t|
    t.integer  "rebalance_type_id"
    t.integer  "account_id"
    t.decimal  "target"
    t.datetime "created_at",        null: false
    t.datetime "updated_at",        null: false
  end

  create_table "rebalance_types", force: :cascade do |t|
    t.string   "rtype"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "summary_types", force: :cascade do |t|
    t.string   "stype"
    t.integer  "priority"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.string   "signin"
    t.string   "password_digest"
    t.string   "remember_token"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
  end

  create_table "what_maps", force: :cascade do |t|
    t.string   "whatmap"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer  "what_id"
  end

  create_table "whats", force: :cascade do |t|
    t.string   "what"
    t.integer  "category_id"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

end
