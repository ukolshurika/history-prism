# frozen_string_literal: true

FactoryBot.define do
  factory :book do
    association :creator, factory: :user
    sequence(:name) { |n| "Test Book #{n}" }
    sequence(:location) { |n| "City #{n}, Country" }

    after(:build) do |book|
      book.attachment.attach(
        io: StringIO.new('%PDF-1.4 sample content'),
        filename: 'test.pdf',
        content_type: 'application/pdf'
      )
    end

    trait :without_attachment do
      after(:build) do |book|
        book.attachment.purge if book.attachment.attached?
      end
    end
  end
end
