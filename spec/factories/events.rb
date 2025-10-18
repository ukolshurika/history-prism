# frozen_string_literal: true

FactoryBot.define do
  factory :event do
    sequence(:title) { |n| "Event #{n}" }
    sequence(:description) { |n| "Description for event #{n}" }
    start_date { Time.current }
    end_date { Time.current + 1.day }
    category { :person }

    association :creator, factory: :user

    trait :world_event do
      category { :world }
    end

    trait :country_event do
      category { :country }
    end

    trait :local_event do
      category { :local }
    end

    trait :with_people do
      after(:create) do |event|
        # Add people if you have a Person model and want to test associations
      end
    end
  end
end
