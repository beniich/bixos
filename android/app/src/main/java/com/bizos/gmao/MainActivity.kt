package com.bizos.gmao

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FirebaseFirestoreSettings
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.firestore.PersistentCacheSettings
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

data class SiteLocation(
    val id: String = "",
    val name: String = "",
    val city: String = "",
    val country: String = "",
    val status: String = "operational",
    val healthScore: Int = 100,
    val activeFailure: String = ""
)

class MainActivity : ComponentActivity() {

    private lateinit var auth: FirebaseAuth
    private lateinit var firestore: FirebaseFirestore
    private var sitesListener: ListenerRegistration? = null

    private val _sites = MutableStateFlow<List<SiteLocation>>(emptyList())
    val sites: StateFlow<List<SiteLocation>> = _sites

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize Firebase
        auth = FirebaseAuth.getInstance()
        firestore = FirebaseFirestore.getInstance()

        // Realtime Firestore Listener
        listenToFirestoreSites()

        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    background = Color(0xFF140826),
                    surface = Color(0xFF1E0A38),
                    primary = Color(0xFFD946EF),
                    secondary = Color(0xFFF472B6)
                )
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    BizOSAndroidDashboard(
                        sitesState = _sites.collectAsState(),
                        onDeclarePanne = { siteId, failureMessage ->
                            declarePanneInFirestore(siteId, failureMessage)
                        }
                    )
                }
            }
        }
    }

    private fun listenToFirestoreSites() {
        sitesListener = firestore.collection("sites")
            .addSnapshotListener { snapshot, error ->
                if (error != null) return@addSnapshotListener
                if (snapshot != null) {
                    val list = snapshot.documents.mapNotNull { doc ->
                        doc.toObject(SiteLocation::class.java)?.copy(id = doc.id)
                    }
                    _sites.value = list
                }
            }
    }

    private fun declarePanneInFirestore(siteId: String, failureMessage: String) {
        val updates = mapOf(
            "status" to "panne",
            "activeFailure" to failureMessage,
            "updatedBy" to "Android Native App",
            "updatedAt" to System.currentTimeMillis().toString()
        )
        firestore.collection("sites").document(siteId).update(updates)
    }

    override fun onDestroy() {
        super.onDestroy()
        sitesListener?.remove()
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BizOSAndroidDashboard(
    sitesState: State<List<SiteLocation>>,
    onDeclarePanne: (String, String) -> Unit
) {
    var selectedSiteId by remember { mutableStateOf("") }
    var failureText by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header Banner
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF240B42)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "BizOS GMAO — Android Native",
                    color = Color(0xFFF472B6),
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace
                )
                Text(
                    text = "Synchronisation Temps Réel Firebase Firestore",
                    color = Color.LightGray,
                    fontSize = 12.sp
                )
            }
        }

        // List of Realtime Sites
        Text(
            text = "Sites Surveillés en Direct (${sitesState.value.size})",
            color = Color.White,
            fontWeight = FontWeight.Bold,
            fontSize = 14.sp
        )

        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(sitesState.value) { site ->
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = when (site.status) {
                            "panne" -> Color(0xFF4C0519)
                            "intervention" -> Color(0xFF451A03)
                            else -> Color(0xFF1E0A38)
                        }
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(site.name, color = Color.White, fontWeight = FontWeight.Bold)
                            Text("${site.city}, ${site.country}", color = Color.Gray, fontSize = 11.sp)
                            if (site.activeFailure.isNotEmpty()) {
                                Text(site.activeFailure, color = Color(0xFFF472B6), fontSize = 11.sp)
                            }
                        }

                        Text(
                            text = site.status.uppercase(),
                            color = when (site.status) {
                                "panne" -> Color(0xFFF43F5E)
                                "intervention" -> Color(0xFFFBBF24)
                                else -> Color(0xFF34D399)
                            },
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }
            }
        }
    }
}
