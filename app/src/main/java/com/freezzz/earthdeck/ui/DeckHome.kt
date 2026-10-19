package com.freezzz.earthdeck.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.freezzz.earthdeck.design.DeckAmber
import com.freezzz.earthdeck.design.DeckBorder
import com.freezzz.earthdeck.design.DeckPanel

private data class FeedItem(val title: String, val source: String, val description: String)

@Composable
fun DeckHome() {
    var expert by remember { mutableStateOf(false) }
    var selected by remember { mutableStateOf<FeedItem?>(null) }
    var section by remember { mutableStateOf("WORLD") }
    val feeds = listOf(
        FeedItem("GEOPHYSICS", "USGS", "Earthquake feed · awaiting live API connection"),
        FeedItem("WEATHER", "OPEN-METEO", "Current conditions · awaiting live API connection"),
        FeedItem("SPACE / ORBIT", "ISS + NOAA", "Orbital telemetry · awaiting live API connection"),
        FeedItem("TRANSPORT", "PUBLIC TRANSPORT", "Regional departures · awaiting live API connection"),
        FeedItem("INFRASTRUCTURE", "MULTI-SOURCE", "Network health · awaiting live API connection")
    )
    BackHandler(enabled = selected != null) { selected = null }

    Column(
        Modifier.fillMaxSize().background(Color(0xFF080B10))
            .windowInsetsPadding(WindowInsets.safeDrawing)
    ) {
        Column(Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 12.dp)) {
            Row(
                Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(Modifier.weight(1f)) {
                    Text("PLANET EARTH", color = Color.White, fontSize = 18.sp)
                    Text("CONTROL DECK", color = Color(0xFF65E5DC), fontSize = 12.sp)
                }
                Button(
                    onClick = { expert = !expert },
                    modifier = Modifier.defaultMinSize(minWidth = 48.dp, minHeight = 48.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF111A24),
                        contentColor = Color.White
                    ),
                    shape = androidx.compose.ui.graphics.RectangleShape,
                    contentPadding = PaddingValues(horizontal = 10.dp)
                ) { Text(if (expert) "EXPERT" else "STANDARD", fontSize = 10.sp) }
            }
            Spacer(Modifier.height(8.dp))
            Text(
                if (expert) "RAW TELEMETRY / DIAGNOSTICS" else "GLOBAL SYSTEMS MONITOR",
                color = DeckAmber,
                fontSize = 10.sp
            )
        }

        when (section) {
            "EVENTS" -> Column(Modifier.weight(1f).fillMaxWidth().padding(14.dp)) {
                Text("EVENT LOG", color = Color.White, fontSize = 14.sp)
                Spacer(Modifier.height(8.dp))
                Text("Live event stream is not connected yet.", color = DeckAmber, fontSize = 12.sp)
                Text("No events are fabricated while the backend is unavailable.", color = Color.LightGray, fontSize = 12.sp)
            }
            "SYSTEM" -> Column(Modifier.weight(1f).fillMaxWidth().padding(14.dp)) {
                Text("SYSTEM STATUS", color = Color.White, fontSize = 14.sp)
                Spacer(Modifier.height(8.dp))
                Text("API: awaiting connection", color = DeckAmber, fontSize = 12.sp)
                Text("Display: portrait / touch-first", color = Color.LightGray, fontSize = 12.sp)
                Text("Tap a feed in WORLD to inspect its current integration status.", color = Color.LightGray, fontSize = 12.sp)
            }
            else -> LazyColumn(
                modifier = Modifier.weight(1f).fillMaxWidth(),
                contentPadding = PaddingValues(start = 12.dp, end = 12.dp, top = 4.dp, bottom = 12.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                item {
                    Column(
                        Modifier.fillMaxWidth().border(1.dp, DeckBorder)
                            .background(DeckPanel).padding(14.dp)
                    ) {
                        Text("GLOBAL STATUS", color = Color.White, fontSize = 12.sp)
                        Spacer(Modifier.height(5.dp))
                        Text("FEEDS AWAITING API CONNECTION", color = DeckAmber, fontSize = 11.sp)
                        Text("Choose a module to inspect details.", color = Color.LightGray, fontSize = 11.sp)
                    }
                }
                items(feeds) { feed ->
                    DeckCard(
                        title = feed.title,
                        value = "—",
                        status = "${feed.source} / AWAITING API",
                        modifier = Modifier.fillMaxWidth()
                    ) { selected = feed }
                }
                item {
                    Text(
                        if (expert) "EXPERT MODE ENABLED · RAW PAYLOADS ARE NOT AVAILABLE UNTIL API INTEGRATION."
                        else "DATA STATUS IS SHOWN EXPLICITLY; UNAVAILABLE FEEDS ARE NOT PRESENTED AS LIVE.",
                        color = Color.LightGray,
                        fontSize = 10.sp,
                        modifier = Modifier.padding(vertical = 8.dp, horizontal = 2.dp)
                    )
                }
            }
        }

        Row(
            Modifier.fillMaxWidth().border(width = 1.dp, color = DeckBorder)
                .background(Color(0xFF080B10)).padding(horizontal = 4.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            listOf("WORLD", "EVENTS", "DATA", "SYSTEM").forEach { item ->
                val active = section == item
                Box(
                    Modifier.weight(1f).heightIn(min = 52.dp)
                        .background(if (active) Color.White else Color.Transparent)
                        .clickable { section = item }
                        .padding(horizontal = 3.dp, vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(item, color = if (active) Color(0xFF080B10) else Color.White, fontSize = 10.sp)
                }
            }
        }
    }

    selected?.let { feed ->
        AlertDialog(
            onDismissRequest = { selected = null },
            confirmButton = { TextButton(onClick = { selected = null }) { Text("BACK") } },
            title = { Text(feed.title) },
            text = {
                Column {
                    Text(feed.source, color = DeckAmber)
                    Spacer(Modifier.height(8.dp))
                    Text(feed.description)
                    Spacer(Modifier.height(8.dp))
                    Text(if (expert) "RAW RESPONSE: NOT AVAILABLE" else "STATUS: AWAITING API", fontSize = 11.sp)
                }
            },
            shape = androidx.compose.ui.graphics.RectangleShape
        )
    }
}