# frozen_string_literal: true

FactoryBot.define do
  factory :fuzzy_date do
    original_text { '1 JAN 1900' }
    date_type { :exact }
    calendar_type { :gregorian }
    year { 1900 }
    month { 1 }
    day { 1 }

    trait :year_only do
      original_text { '1900' }
      date_type { :year }
      month { nil }
      day { nil }
    end

    trait :month_year do
      original_text { 'JAN 1900' }
      date_type { :month_year }
      day { nil }
    end

    trait :about do
      original_text { 'ABT 1900' }
      date_type { :about }
      month { nil }
      day { nil }
    end

    trait :before do
      original_text { 'BEF 1925' }
      date_type { :before }
      year { 1925 }
      month { nil }
      day { nil }
    end

    trait :after do
      original_text { 'AFT 1880' }
      date_type { :after }
      year { 1880 }
      month { nil }
      day { nil }
    end

    trait :estimated do
      original_text { 'EST 1850' }
      date_type { :estimated }
      year { 1850 }
      month { nil }
      day { nil }
    end

    trait :calculated do
      original_text { 'CAL 1860' }
      date_type { :calculated }
      year { 1860 }
      month { nil }
      day { nil }
    end

    trait :between do
      original_text { 'BET 1900 AND 1910' }
      date_type { :between }
      year { 1900 }
      month { nil }
      day { nil }
      year_end { 1910 }
      month_end { nil }
      day_end { nil }
    end

    trait :from_to do
      original_text { 'FROM 1 JAN 1900 TO 31 DEC 1910' }
      date_type { :from_to }
      year { 1900 }
      month { 1 }
      day { 1 }
      year_end { 1910 }
      month_end { 12 }
      day_end { 31 }
    end
  end
end
