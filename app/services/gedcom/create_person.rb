# frozen_string_literal: true

module Gedcom
  class CreatePerson
    params = -> {
      param :person_attrs
      param :gedcom_file_id
      param :user_id
    }

    include Dry::Initializer.define params

    def call
      person.update!(normalize_attrs)
    end

    private

    def person
      @person ||= Person.find_or_initialize_by(user_id: user_id, gedcom_file_id: gedcom_file_id,
                                               gedcom_uuid: normalize_id)
    end

    def normalize_id
      person_attrs.id.gsub('@', '')
    end

    def normalize_attrs
      {
        first_name: person_attrs.givn,
        name: person_attrs.name,
        last_name: person_attrs.surn
      }
    end
  end
end
