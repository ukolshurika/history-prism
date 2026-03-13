# frozen_string_literal: true

FactoryBot.define do
  factory :event do
    sequence(:title) { |n| "Event #{n}" }
    sequence(:description) { |n| "Description for event #{n}" }
    category { :person }

    association :creator, factory: :user
    association :start_date, factory: :fuzzy_date
    association :end_date, factory: :fuzzy_date

    trait :world_event do
      category { :world }
    end

    trait :country_event do
      category { :country }
    end

    trait :local_event do
      category { :local }
    end

    trait :with_location do
      association :location, factory: :location
    end

    trait :with_people do
      after(:create) do |event|
        # Add people if you have a Person model and want to test associations
      end
    end
  end

  factory :location do
    place { 'Москва' }
    latitude { 55.7558 }
    longitude { 37.6173 }
  end
end
