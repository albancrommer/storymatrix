#!/bin/bash 
APP_PATH=$(cd `dirname ${BASH_SOURCE[0]}` && pwd )
cd $APP_PATH
panic() { echo "$@"; exit 2; }

# On raspberry, with ADAFRUIT Thermal Printer, you MUST parameter it right
if [[ -f /usr/bin/raspi-config ]]; then
  echo "Votre Raspberry doit être configurée correctement pour les imprimantes ADAFRUIT sur port série."
  read -n 1 -p "Souhaitez-vous accéder aux réglages via raspi-config ? [N/yo] : "
  echo ""
  REPLY=${REPLY:-N}
  if [[ "${REPLY^^}" == "Y" ]] || [[ "${REPLY^^}" == "O" ]] ; then 
    echo -e "\n\nRappel: \n[5:Interfacing]\n  -->[6:serial]\n    -->[serial shell:No]\n    -->[activate port:YES]\n"
    echo "Chargement en cours..."
    sleep 3
    sudo /usr/bin/raspi-config
    echo -e "\nRebooting in "
    for i in {3..1}; do echo -n "${i}... "; sleep 1; done 
    reboot
  fi
fi

# Create the printer config file for php
PHP_CONFIG="${APP_PATH}/php-print/config.php"
if [[ ! -f "${PHP_CONFIG}" ]] ; then 
  echo -e "\nQuel device d'imprimante souhaitez-vous utiliser ?"
  echo "  Ex: /dev/ttyAMAO pour les imprimantes ADAFRUIT sur raspberry (choix par défaut)"
  echo -e "  Ex: /dev/usb/lp0 pour certains imprimantes thermiques standards\n"
  read -p "Merci de fournir votre device: " DEVICE
  DEVICE=${DEVICE:-"/dev/ttyAMA0"}
  [[ -e "$DEVICE" ]] || panic "Désolé, $DEVICE n'existe pas."
  cp "${PHP_CONFIG}.template" "${PHP_CONFIG}"
  sed -i "s=%DEVICE%=$DEVICE=" "${PHP_CONFIG}"
fi

# Some debian packages install
which node &>/dev/null || packageList+=( nodejs )
which npm &>/dev/null || packageList+=( npm )
which php &>/dev/null || packageList+=( php-cli )
dpkg -l php-mbstring &>/dev/null || packageList+=( php-mbstring )
[ 0 -ne ${#packageList[@]} ] && { echo "Installation des packages ${packageList[@]}"; sudo apt update; sudo apt install -y "${packageList[@]}" ; }

# The node dependancies install
echo "Installation des dépendances node" && npm install

