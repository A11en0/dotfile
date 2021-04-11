import qbs 1.0
import '../QtModule.qbs' as QtModule

QtModule {
    qtModuleName: "TextToSpeech"
    Depends { name: "Qt"; submodules: ["core"]}

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
    libNameForLinkerDebug: "Qt5TextToSpeech"
    libNameForLinkerRelease: "Qt5TextToSpeech"
    libFilePathDebug: ""
    libFilePathRelease: "/home/allen/.anaconda3/lib/libQt5TextToSpeech.so.5.9.6"
    cpp.defines: ["QT_TEXTTOSPEECH_LIB"]
    cpp.includePaths: ["/home/allen/.anaconda3/include/qt", "/home/allen/.anaconda3/include/qt/QtTextToSpeech"]
    cpp.libraryPaths: ["/home/allen/.anaconda3/lib", "/home/allen/.anaconda3/lib"]
    Group {
        files: [Qt["texttospeech"].libFilePath]
        filesAreTargets: true
        fileTags: ["dynamiclibrary"]
    }
}
