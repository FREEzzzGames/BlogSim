plugins { id("com.android.library"); id("org.jetbrains.kotlin.android"); id("org.jetbrains.kotlin.plugin.serialization") }
android { namespace="com.freezzz.earthdeck.network"; compileSdk=35; defaultConfig { minSdk=26 } }
dependencies { implementation("com.squareup.retrofit2:retrofit:2.11.0"); implementation("com.squareup.okhttp3:okhttp:4.12.0"); implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.8.0"); implementation("com.squareup.retrofit2:converter-kotlinx-serialization:2.11.0") }
