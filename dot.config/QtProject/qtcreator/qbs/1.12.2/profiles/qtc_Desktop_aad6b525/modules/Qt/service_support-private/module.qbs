import qbs 1.0
import '../QtModule.qbs' as QtModule

QtModule {
    qtModuleName: "ServiceSupport"
    Depends { name: "Qt"; submodules: ["core-private", "gui-private"]}

    architectures: ["x86_64"]
    targetPlatform: "linux"
    hasLibrary: true
    staticLibsDebug: []
    staticLibsRelease: ["GL"]
    dynamicLibsDebug: []
    dynamicLibsRelease: []
    linkerFlagsDebug: []
    linkerFlagsRelease: []
    frameworksDebug: []
    frameworksRelease: []
    frameworkPathsDebug: []
    frameworkPathsRelease: []
    libNameForLinkerDebug: "Qt5ServiceSupport"
    libNameForLinkerRelease: "Qt5ServiceSupport"
    libFilePathDebug: ""
    libFilePathRelease: "/home/allen/.anaconda3/lib/libQt5ServiceSupport.a"
    cpp.defines: ["QT_SERVICE_SUPPORT_LIB"]
    cpp.includePaths: ["/home/allen/.anaconda3/include/qt", "/home/allen/.anaconda3/include/qt/QtServiceSupport", "/home/allen/.anaconda3/include/qt/QtServiceSupport/5.9.6", "/home/allen/.anaconda3/include/qt/QtServiceSupport/5.9.6/QtServiceSupport"]
    cpp.libraryPaths: ["/home/allen/.anaconda3/lib", "/home/allen/.anaconda3/lib"]
    isStaticLibrary: true
Group {
        files: [Qt["service_support-private"].libFilePath]
        filesAreTargets: true
        fileTags: ["staticlibrary"]
    }
}
