# frozen_string_literal: true

class GedcomFilePolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope.where(user: user)
    end
  end

  def index?
    user.present?
  end

  def create?
    user.present?
  end

  def destroy?
    user.present? && record.user_id == user.id
  end
end
