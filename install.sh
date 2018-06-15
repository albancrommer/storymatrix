#!/bin/bash 
APP_PATH=$(cd `dirname ${BASH_SOURCE[0]}` && pwd )
cd $APP_PATH
panic() { echo "$@"; exit 2; }

# On raspberry, with ADAFRUIT Thermal Printer, you MUST parameter it right
if [[ -f /usr/bin/raspi-config ]]; then
  echo "Votre Raspberry doit être configurée correctement pour les imprimantes ADAFRUIT sur port série."
  echo "Rappel: [5:Interfacing]-->[6:serial]-->[serial shell:No],[activate port:YES]
  read -n 1 -p "Souhaitez-vous accéder aux réglages via raspi-config ? [N/yo]"
  REPLY=${REPLY:-N}
  [[ "${REPLY^^}" == "Y ]] || [[ "${REPLY^^}" == "O ]] && /usr/bin/raspi-config
  echo "Rebooting in "
  for i in {3..1}; do echo -n "${i}... "; sleep 1; done 
  reboot
fi

# Some debian packages install
which node &>/dev/null || packageList+=( nodejs )
which php &>/dev/null || packageList+=( php-cli )
which php-mbstring &>/dev/null || packageList+=( php-mbstring )

# The node dependancies install
[ 0 -ne ${#packageList[@]} ] && { echo "Installation des packages ${packageList[@]}"; sudo aptitude install "${packageList[@]}" ; }
echo "Installation des dépendances node" && npm install

