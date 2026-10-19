package com.freezzz.earthdeck.domain
data class FeedHealth(val source:String,val state:String,val fetchedAt:String?,val latencyMs:Long?,val message:String?=null)
data class StrategicSnapshot(val key:String,val title:String,val primaryValue:String,val status:String,val sourceUrl:String,val timestamp:String,val rawJson:String)
interface DeckRepository{suspend fun refresh(group:String):Result<StrategicSnapshot>;suspend fun cached(group:String):StrategicSnapshot?}
