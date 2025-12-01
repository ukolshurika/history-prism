# frozen_string_literal: true

module GedcomParserApi
  Error = Class.new StandardError
  EVENTS_PATH = '/events'

class Event < Dry::Struct

  end

  class Person < Dry::Struct
  end

  class CallbackResponse <Dry::Struct
  end

  module_function

  def get_events(blob_key, user_id)
    Transport.post(EVENTS_PATH, { file: blob_key, user_id: user_id }.to_json)
  end

  def parse_events(persons, events, user_id)
  end
end
