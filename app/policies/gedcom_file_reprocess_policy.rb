# frozen_string_literal: true

class GedcomFileReprocessPolicy < ApplicationPolicy
  def create?
    user.present? && record.user_id == user.id
  end
end
