# frozen_string_literal: true

class EventPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope.all
    end
  end

  def index?
    true
  end

  def show?
    true
  end

  def create?
    user.present?
  end

  def update?
    user.present? && record.creator_id == user.id
  end

  def destroy?
    user.present? && record.creator_id == user.id
  end
end
