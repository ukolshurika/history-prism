# frozen_string_literal: true

class TimelinePolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope.where(user: user)
    end
  end

  def index?
    user.present?
  end

  def show?
    user.present? && (record.visible? || record.user_id == user.id)
  end

  def create?
    user.present?
  end

  def update?
    user.present? && record.user_id == user.id
  end

  def destroy?
    user.present? && record.user_id == user.id
  end

  def export_pdf?
    user.present? && (record.visible? || record.user_id == user.id)
  end

  def download_pdf?
    user.present? && (record.visible? || record.user_id == user.id)
  end
end
