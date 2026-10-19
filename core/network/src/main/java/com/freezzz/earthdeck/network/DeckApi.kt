package com.freezzz.earthdeck.network
import kotlinx.serialization.Serializable
import retrofit2.http.GET
import retrofit2.http.Path
@Serializable data class ApiEnvelope(val generated_at:String?=null,val source:String?=null,val cached:Boolean=false,val ok:Boolean=true,val data:kotlinx.serialization.json.JsonElement?=null,val error:String?=null)
interface DeckApi{@GET("api/v1/{feed}") suspend fun feed(@Path("feed") feed:String):ApiEnvelope}
