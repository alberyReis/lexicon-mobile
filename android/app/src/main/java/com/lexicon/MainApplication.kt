package com.lexicon

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import java.io.File

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()

    initializeDatabase()

    loadReactNative(this)
  }

  private fun initializeDatabase() {
    val databaseFile = File(filesDir, "lexicon.db")

    if (databaseFile.exists()) {
      return
    }

    val temporaryFile = File(filesDir, "lexicon.db.tmp")

    try {
      assets.open("lexicon.db").use { input ->
        temporaryFile.outputStream().use { output ->
          input.copyTo(output)
        }
      }

      if (!temporaryFile.renameTo(databaseFile)) {
        throw IllegalStateException("Failed to initialize the SQLite database")
      }
    } catch (error: Exception) {
      temporaryFile.delete()
      throw error
    }
  }
}