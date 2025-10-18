# frozen_string_literal: true

class CreatorSerializer < ActiveModel::Serializer
  attributes :id, :email

  def id
    object.id
  end

  def email
    object.email
  end
end
