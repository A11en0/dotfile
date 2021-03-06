import qbs 1.0
import '../QtModule.qbs' as QtModule

QtModule {
    qtModuleName: "NetworkAuth"
    Depends { name: "Qt"; submodules: ["core", "network"]}

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
    libNameForLinkerDebug: "Qt5NetworkAuth"
    libNameForLinkerRelease: "Qt5NetworkAuth"
    libFilePathDebug: ""
    libFilePathRelease: "/home/allen/.anaconda3/lib/libQt5NetworkAuth.so.5.9.6"
    cpp.defines: ["QT_NETWORKAUTH_LIB"]
    cpp.includePaths: ["/home/allen/.anaconda3/include/qt", "/home/allen/.anaconda3/include/qt/QtNetworkAuth"]
    cpp.libraryPaths: ["/home/allen/.anaconda3/lib", "/home/allen/.anaconda3/lib"]
    Group {
        files: [Qt["networkauth"].libFilePath]
        filesAreTargets: true
        fileTags: ["dynamiclibrary"]
    }
}
