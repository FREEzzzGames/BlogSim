plugins { id("com.android.library"); id("org.jetbrains.kotlin.android"); id("org.jetbrains.kotlin.plugin.serialization") }
android { namespace="com.freezzz.earthdeck.datastore"; compileSdk=35; defaultConfig { minSdk=26 } }
dependencies { implementation("androidx.datastore:datastore:1.1.3"); implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.8.0") }
