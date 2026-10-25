; Varsayılan kurulum klasörü: Program Files\CiciByte\Atrium (kullanıcı yine değiştirebilir).
; electron-builder kurulum yolunu bu kayıt anahtarından okur; ilk kurulumda burayı önceden doldururuz.
!macro preInit
  SetRegView 64
  ReadRegStr $0 HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation
  StrCmp $0 "" 0 +3
    WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$PROGRAMFILES64\CiciByte\Atrium"
    WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$PROGRAMFILES64\CiciByte\Atrium"
  SetRegView 32
!macroend
