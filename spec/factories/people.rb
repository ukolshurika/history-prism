# frozen_string_literal: true

FactoryBot.define do
  factory :person do
    sequence(:first_name) { |n| "FirstName#{n}" }
    sequence(:middle_name) { |n| "MiddleName#{n}" }
    sequence(:last_name) { |n| "LastName#{n}" }
    sequence(:gedcom_uuid) { |n| "@P#{n}@" }

    association :user

    trait :with_events do
      after(:create) do |person, evaluator|
        create_list(:event, 2, category: :person, creator: person.user, people: [person])
      end
    end

    trait :without_middle_name do
      middle_name { nil }
    end

    trait :without_last_name do
      last_name { nil }
    end
  end
end
