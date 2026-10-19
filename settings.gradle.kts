pluginManagement { repositories { google(); mavenCentral(); gradlePluginPortal() } }
dependencyResolutionManagement { repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS); repositories { google(); mavenCentral() } }
rootProject.name="PlanetEarthControlDeck"
include(":app",":core:designsystem",":core:ui",":core:network",":core:database",":core:datastore",":core:domain",":core:common",":feature:geophysics",":feature:weather",":feature:space",":feature:transport",":feature:infrastructure",":feature:settings",":feature:modal",":sync")
