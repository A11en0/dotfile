import qbs 1.0
import '../QtModule.qbs' as QtModule

QtModule {
    qtModuleName: "WebEngineCore"
    Depends { name: "Qt"; submodules: ["core", "gui", "qml", "quick", "webchannel", "positioning"]}

    architectures: ["x86_64"]
    targetPlatform: "linux"
    hasLibrary: true
    staticLibsDebug: []
    staticLibsRelease: []
    dynamicLibsDebug: []
    dynamicLibsRelease: []
    linkerFlagsDebug: []
    linkerFlagsRelease: []
    frameworksDebug: []
    frameworksRelease: []
    frameworkPathsDebug: []
    frameworkPathsRelease: []
    libNameForLinkerDebug: "Qt5WebEngineCore"
    libNameForLinkerRelease: "Qt5WebEngineCore"
    libFilePathDebug: ""
    libFilePathRelease: "/home/allen/.anaconda3/lib/libQt5WebEngineCore.so.5.9.6"
    cpp.defines: ["QT_WEBENGINECORE_LIB"]
    cpp.includePaths: ["/home/allen/.anaconda3/include/qt", "/home/allen/.anaconda3/include/qt/QtWebEngineCore"]
    cpp.libraryPaths: ["/home/allen/.anaconda3/lib", "/home/allen/.anaconda3/lib", "/home/allen/.anaconda3/lib", "/home/allen/.anaconda3/lib", "/home/allen/.anaconda3/lib", "/home/allen/.anaconda3/lib", "/home/allen/.anaconda3/lib", "/home/allen/.anaconda3/lib", "/home/allen/.anaconda3/lib", "/home/allen/.anaconda3/lib", "/home/allen/.anaconda3/lib", "/home/allen/.anaconda3/lib", "/home/allen/.anaconda3/lib", "/home/allen/.anaconda3/lib", "/home/allen/.anaconda3/lib", "/home/allen/.anaconda3/lib", "/home/allen/.anaconda3/lib", "/home/allen/.anaconda3/lib", "/home/allen/.anaconda3/lib", "/home/allen/.anaconda3/lib"]
    Group {
        files: [Qt["webenginecore"].libFilePath]
        filesAreTargets: true
        fileTags: ["dynamiclibrary"]
    }
}
