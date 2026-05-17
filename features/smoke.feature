Feature: Project skeleton smoke test
  As the author of poltergink
  I want a runnable acceptance test from day one
  So that the ATDD workflow is wired end-to-end before any real feature lands

  Scenario: The package exposes a version constant
    Given the poltergink package is importable
    When I read its exported VERSION
    Then it should match the package.json version
