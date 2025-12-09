FactoryBot.define do
  factory :timeline do
    user
    person { association :person, user: user }
    visible { false }
    sequence(:title) { |n| "Timeline #{n}" }
    start_at { 100.years.ago }
    end_at { 20.years.ago }
    event_configuration { {} }
    cached_events_for_display { { events: [] } }
  end
end
