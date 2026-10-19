package com.freezzz.earthdeck.datastore
import kotlinx.serialization.Serializable
@Serializable data class DeckSettings(val locale:String="en",val mode:String="SIMPLE",val fontScale:Float=1f,val orientation:String="auto",val refreshSeconds:Int=60,val kiosk:Boolean=false,val accent:String="white",val visibleFeeds:Set<String> = setOf("geophysics","weather","space","transport","infrastructure"))
