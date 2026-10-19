plugins { id("com.android.library"); id("org.jetbrains.kotlin.android") }
android { namespace="com.freezzz.earthdeck.domain"; compileSdk=35; defaultConfig { minSdk=26 } }
dependencies { implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.10.1"); implementation(project(":core:common")) }
