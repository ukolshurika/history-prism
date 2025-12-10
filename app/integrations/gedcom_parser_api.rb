# frozen_string_literal: true

module GedcomParserApi
  Error = Class.new StandardError
  EVENTS_PATH = '/events'
  PERSONS_PATH = '/persons'
  PERSON_PATH = '/person'
  TIMELINE_PATH = '/timeline'


  class Event < Dry::Struct
    schema schema.strict
    attribute :begin, Types::Coercible::String
    attribute :end, Types::Coercible::String
    attribute :identificator, Types::Coercible::String
    attribute :name, Types::Coercible::String
    attribute :description, Types::Coercible::String
  end

  class Person < Dry::Struct
    attribute :name, Types::Coercible::String
    attribute :givn, Types::Coercible::String.optional.default(nil)
    attribute :surn, Types::Coercible::String.optional.default(nil)
    attribute :id, Types::Coercible::String
    attribute :gender, Types::Coercible::String.optional.default(nil)
  end

  class CallbackResponse <Dry::Struct
    attribute :people, Types::Nominal::Array.of(Person)
  end

  module_function

  def people(blob_key)
    Transport.get(PERSONS_PATH, { file: blob_key }).body
  end

  def person(blob_key, person_gedid)
    Person.new(Transport.get(PERSON_PATH, { file: blob_key, id: person_gedid }).body.deep_symbolize_keys)
  end

  def timeline(blob_key, person_id)
    Transport.get(TIMELINE_PATH, { file: blob_key, gedcom_id: person_id })
  end

  def parse_events(persons, events, user_id)
  end
end
