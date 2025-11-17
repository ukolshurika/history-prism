# frozen_string_literal: true

FactoryBot.define do
  factory :gedcom_file do
    association :user

    after(:build) do |gedcom_file|
      gedcom_file.file.attach(
        io: StringIO.new("0 HEAD\n1 SOUR Family Tree\n0 TRLR"),
        filename: 'test.ged',
        content_type: 'application/octet-stream'
      )
    end

    trait :without_file do
      after(:build) do |gedcom_file|
        gedcom_file.file.purge if gedcom_file.file.attached?
      end
    end
  end
end
