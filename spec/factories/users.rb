# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    password { 'TestPassword123' }
    password_confirmation { 'TestPassword123' }

    trait :admin do
      # Add admin-specific attributes if you have an admin flag
      # admin { true }
    end
  end
end
