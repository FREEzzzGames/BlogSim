package com.freezzz.earthdeck.server
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.routing.*
import io.ktor.server.response.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import kotlin.time.Duration.Companion.seconds
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.*
import java.net.URL
import java.net.HttpURLConnection
import java.util.concurrent.ConcurrentHashMap
@Serializable data class Envelope(val generated_at:String,val source:String,val cached:Boolean,val ok:Boolean,val data:JsonElement?=null,val error:String?=null)
private data class Cached(val at:Long,val body:String)
private val cache=ConcurrentHashMap<String,Cached>()
private val urls=mapOf("geophysics" to "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson","weather" to "https://api.open-meteo.com/v1/forecast?latitude=48.89&longitude=8.70&current=temperature_2m,relative_humidity_2m,wind_speed_10m","space" to "https://api.wheretheiss.at/v1/satellites/25544","transport" to "https://v6.db.transport.rest/locations/nearby?latitude=48.895&longitude=8.704&distance=30000&results=20&poi=false","infrastructure" to "https://cloudflare-dns.com/dns-query?name=cloudflare.com&type=NS","eonet" to "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=20","github" to "https://api.github.com/events")
private val ttl=mapOf("geophysics" to 60000L,"weather" to 120000L,"space" to 5000L,"transport" to 30000L,"infrastructure" to 60000L,"eonet" to 600000L,"github" to 30000L)
fun Application.module(){install(ContentNegotiation){json(Json{ignoreUnknownKeys=true})};install(CORS){anyHost();allowHeader("Content-Type")};install(WebSockets){pingPeriod=20.seconds;timeout=30.seconds;maxFrameSize=Long.MAX_VALUE;masking=false};routing{get("/health"){call.respond(mapOf("ok" to true,"service" to "earthdeck","time" to java.time.Instant.now().toString()))};get("/ready"){call.respond(mapOf("ready" to true,"databaseConfigured" to !System.getenv("DATABASE_URL").isNullOrBlank(),"redisConfigured" to !System.getenv("REDIS_URL").isNullOrBlank()))};get("/metrics"){call.respondText("# HELP earthdeck_cache_entries Number of feed cache entries\n# TYPE earthdeck_cache_entries gauge\nearthdeck_cache_entries ${cache.size}\n",io.ktor.http.ContentType.parse("text/plain; version=0.0.4"))};get("/docs"){call.respondText("OpenAPI schema at /openapi.json")};get("/openapi.json"){call.respondText("""{"openapi":"3.1.0","info":{"title":"Planet Earth Control Deck","version":"1.0.0"},"paths":{"/health":{"get":{"responses":{"200":{"description":"Health"}}}}}}""",io.ktor.http.ContentType.Application.Json)};get("/api/v1/{feed}"){val feed=call.parameters["feed"]?:return@get;val target=urls[feed]?:return@get call.respond(io.ktor.http.HttpStatusCode.NotFound,mapOf("error" to "unknown_feed"));val now=System.currentTimeMillis();val previous=cache[feed];if(previous!=null&&now-previous.at<(ttl[feed]?:60000)){call.respondText(previous.body,io.ktor.http.ContentType.Application.Json);return@get};try{val c=URL(target).openConnection() as HttpURLConnection;c.connectTimeout=8000;c.readTimeout=8000;c.setRequestProperty("Accept",if(feed=="infrastructure")"application/dns-json" else "application/json");if(feed=="github")c.setRequestProperty("User-Agent","PlanetEarthControlDeck/1.0");if(c.responseCode !in 200..299)error("upstream_http_${c.responseCode}");val raw=c.inputStream.bufferedReader().use{it.readText()};require(raw.length<2000000){"response_too_large"};val body=Json.encodeToString(Envelope(java.time.Instant.now().toString(),feed,false,true,Json.parseToJsonElement(raw)));cache[feed]=Cached(now,body);call.respondText(body,io.ktor.http.ContentType.Application.Json)}catch(e:Exception){if(previous!=null){val stale=Json.parseToJsonElement(previous.body).jsonObject.toMutableMap();stale["cached"]=JsonPrimitive(true);stale["ok"]=JsonPrimitive(false);stale["error"]=JsonPrimitive("upstream_unavailable_using_stale_cache");call.respondText(JsonObject(stale).toString(),io.ktor.http.ContentType.Application.Json)}else call.respond(io.ktor.http.HttpStatusCode.BadGateway,Envelope(java.time.Instant.now().toString(),feed,false,false,error="upstream_unavailable"))}};webSocket("/ws/alerts"){send(Frame.Text("""{"type":"connected","alerts":"worker not configured"}"""));for(frame in incoming){if(frame is Frame.Text&&frame.readText()=="ping")send(Frame.Text("""{"type":"pong"}"""))}}}}
fun main(){embeddedServer(Netty,port=System.getenv("PORT")?.toIntOrNull()?:8080,host="0.0.0.0",module=Application::module).start(wait=true)}
