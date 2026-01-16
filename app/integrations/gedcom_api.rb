# frozen_string_literal: true

module GedcomApi
  Error = Class.new StandardError
  EVENTS_PATH = '/events'
  PERSONS_PATH = '/persons'
  PERSON_PATH = '/person'
  TIMELINE_PATH = '/timeline'

  class Event < Dry::Struct
    attribute :name, Types::Coercible::String
    attribute :date, Types::Coercible::String
    attribute :description, Types::Coercible::String
    attribute :place, Types::Coercible::String
    attribute :notes, Types::Coercible::String
  end

  class Person < Dry::Struct
    attribute :name, Types::Coercible::String
    attribute :givn, Types::Coercible::String.optional.default(nil)
    attribute :surn, Types::Coercible::String.optional.default(nil)
    attribute :id, Types::Coercible::String
    attribute :gender, Types::Coercible::String.optional.default(nil)
  end

  class CallbackResponse < Dry::Struct
    attribute :people, Types::Nominal::Array.of(Person)
  end

  module_function

  def people(blob_key)
    Transport.get(PERSONS_PATH, { file: blob_key }).body
  end

  def person(blob_key, person_id)
    Person.new(Transport.get(PERSON_PATH, { file: blob_key, id: "@#{person_id}@" }).body.deep_symbolize_keys)
  end

  def timeline(blob_key, person_id)
    Transport.get(TIMELINE_PATH, { file: blob_key, gedcom_id: "@#{person_id}@" }).body['timeline'].map do |e|
      Event.new(e.deep_symbolize_keys)
    end
  end
end
