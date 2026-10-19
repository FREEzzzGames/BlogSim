package com.freezzz.earthdeck.ui
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.unit.dp
@Composable fun DeckHome(){var expert by remember{mutableStateOf(false)};var selected by remember{mutableStateOf<String?>(null)};val cards=listOf("GEOPHYSICS" to "USGS","WEATHER" to "OPEN-METEO","SPACE" to "ISS + NOAA","TRANSPORT" to "LIVE DEPARTURES","INFRASTRUCTURE" to "MULTI-SOURCE");val wide=LocalConfiguration.current.screenWidthDp>=840;Column(Modifier.fillMaxSize().padding(12.dp)){Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.SpaceBetween){Text("PLANET EARTH CONTROL DECK",style=MaterialTheme.typography.titleLarge);TextButton(onClick={expert=!expert}){Text(if(expert)"[ EXPERT ]" else "[ SIMPLE ]")}};Text(if(expert)"RAW TELEMETRY ENABLED" else "GLOBAL SYSTEMS MONITOR",style=MaterialTheme.typography.labelSmall);Spacer(Modifier.height(12.dp));LazyVerticalGrid(columns=GridCells.Fixed(if(wide)3 else 1),modifier=Modifier.weight(1f),horizontalArrangement=Arrangement.spacedBy(8.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){items(cards){c->DeckCard(c.first,"—",c.second+" / AWAITING API",Modifier.fillMaxWidth()){selected=c.first}}}};selected?.let{c->AlertDialog(onDismissRequest={selected=null},confirmButton={TextButton(onClick={selected=null){Text("[ CLOSE × ]")}},title={Text(c)},text={Text(if(expert)"RAW PAYLOAD NOT YET LOADED" else "Live status pending backend integration")},shape=androidx.compose.ui.graphics.RectangleShape)}}
