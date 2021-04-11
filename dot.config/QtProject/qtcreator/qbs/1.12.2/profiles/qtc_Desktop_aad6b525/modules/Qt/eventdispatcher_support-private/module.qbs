import qbs 1.0
import '../QtModule.qbs' as QtModule

QtModule {
    qtModuleName: "EventDispatcherSupport"
    Depends { name: "Qt"; submodules: ["core-private", "gui-private"]}

    architectures: ["x86_64"]
    targetPlatform: "linux"
    hasLibrary: true
    staticLibsDebug: []
    staticLibsRelease: ["GL", "gthread-2.0", "rt", "glib-2.0"]
    dynamicLibsDebug: []
    dynamicLibsRelease: []
    linkerFlagsDebug: []
    linkerFlagsRelease: []
    frameworksDebug: []
    frameworksRelease: []
    frameworkPathsDebug: []
    frameworkPathsRelease: []
    libNameForLinkerDebug: "Qt5EventDispatcherSupport"
    libNameForLinkerRelease: "Qt5EventDispatcherSupport"
    libFilePathDebug: ""
    libFilePathRelease: "/home/allen/.anaconda3/lib/libQt5EventDispatcherSupport.a"
    cpp.defines: ["QT_EVENTDISPATCHER_SUPPORT_LIB"]
    cpp.includePaths: ["/home/allen/.anaconda3/include/qt", "/home/allen/.anaconda3/include/qt/QtEventDispatcherSupport", "/home/allen/.anaconda3/include/qt/QtEventDispatcherSupport/5.9.6", "/home/allen/.anaconda3/include/qt/QtEventDispatcherSupport/5.9.6/QtEventDispatcherSupport"]
    cpp.libraryPaths: ["/home/allen/.anaconda3/lib", "/home/allen/.anaconda3/lib"]
    isStaticLibrary: true
Group {
        files: [Qt["eventdispatcher_support-private"].libFilePath]
        filesAreTargets: true
        fileTags: ["staticlibrary"]
    }
}
