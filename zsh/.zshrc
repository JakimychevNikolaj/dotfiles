export TERM="xterm-256color"
# Path to your oh-my-zsh installation.
export ZSH=$HOME/.oh-my-zsh

LC_CTYPE="ru_RU.UTF-8"
export LANG="ru_RU.UTF-8"
LC_ALL=ru_RU.UTF-8


ZSH_THEME="agnoster1"

ENABLE_CORRECTION="true"

plugins=(zsh-autosuggestions zsh-syntax-highlighting  git)

# User configuration

#export PATH="/usr/local/sbin:/usr/local/bin:/usr/bin:/opt/android-sdk/tools:/usr/lib/jvm/default/bin:/usr/bin/site_perl:/usr/bin/vendor_perl:/usr/bin/core_perl"

alias gd='git diff'

alias gnb='gcm && gpu && gcb'

alias gai='git add --interactive'

alias gad='git add'

alias gpr='git pull --rebase'

alias gcb='git checkout -b'

alias gcm='git checkout master'

alias gpu='git pull origin `git rev-parse --abbrev-ref HEAD`'

alias gb='git branch'

alias gl='git lg'

alias s='sudo pacman -S'

alias startT='teamviewer --daemon start'

alias stopT='teamviewer --daemon stop'

alias sus='sudo pm-suspend && clear && sleep 20 && currency && weather'

alias currency='cconv 1 usd rub && cconv 1 eur rub && cconv 1 btc usd'

alias S='sudo pacman -Syu'

alias R='sudo pacman -R'

alias y='yaourt'

alias yu='yaourt -Syu --aur'

alias Y='yaourt -Syua --noconfirm'

alias h='history'

alias grep='egrep'

alias v='nvim'

alias df='df -m'

alias disk='sudo fdisk -l'

alias tree='find . -type d | sed -e "s/[^-][^\/]*\//  |/g" -e "s/|\([^ ]\)/|-\1/"'

alias remove='yaourt -Rs'

alias poff='sudo systemctl poweroff'

alias caps='setxkbmap -layout us -option ctrl:nocaps && setxkbmap -layout us,ru -variant -option grp:alt_shift_toggle,terminate:ctrl_alt_bksp &'

alias csc='echo "#include <iostream>
int main() {
	std::cout << \"hello motherfucker\" << std::endl;
	return 0;
}" > main.cpp && echo "
cmake_minimum_required(VERSION 3.5)
get_filename_component(ProjectId \${CMAKE_CURRENT_SOURCE_DIR} NAME)
string(REPLACE \" \" \"_\" ProjectId \${ProjectId})
project(\${ProjectId})

file(GLOB \${PROJECT_NAME}_SRC
    \"*.h\"
    \"*.cpp\"
)

add_executable(\${PROJECT_NAME} \${\${PROJECT_NAME}_SRC})

" > CMakeLists.txt'


alias crf='echo "#!/bin/bash
cmake .
make
./\"\${PWD##*/}\"
" > run.sh && chmod u+x run.sh'

alias blank_cpp_project='csc && crf && ./run.sh && git init'
alias np='cd ~/Dropbox/Projects/ && mkdir $(date +%F) && cd $_'
source $ZSH/oh-my-zsh.sh

alias weather='curl -4 http://wttr.in/'

alias mvv='setopt +o nomatch && mv *.flv *.mkv *.webm *.mp4 ~/videos'

alias git_override='git fetch --all && git reset --hard origin/`git rev-parse --abbrev-ref HEAD`'

alias gp='git push origin `git rev-parse --abbrev-ref HEAD`'

alias ga='git add .'

alias gr='git reset'

alias gs='git status'

alias gc='git commit -v'

alias gf='ga && gc && gp'

mkd ()
{
    mkdir -p -- "$1" &&
      cd -P -- "$1"
}

cconv() 
{
  wget -qO- "http://www.google.com/finance/converter?a=$1&from=$2&to=$3" |  sed '/res/!d;s/<[^>]*>//g';
}

COMPLETION_WAITING_DOTS="true"

bindkey '^P' up-history
bindkey '^N' down-history
bindkey '^?' backward-delete-char
bindkey '^h' backward-delete-char
bindkey '^w' backward-kill-word
bindkey '^r' history-incremental-search-backward

precmd() { RPROMPT="" }
function zle-line-init zle-keymap-select {
VIM_PROMPT="%{$fg_bold[yellow]%} [% NORMAL]%  %{$reset_color%}"
RPS1="${${KEYMAP/vicmd/$VIM_PROMPT}/(main|viins)/} $EPS1"
zle reset-prompt
}

zle -N zle-line-init
zle -N zle-keymap-select

export KEYTIMEOUT=1
zstyle ':completion:*' menu select
export EDITOR=/usr/bin/nvim
export VISUAL=/usr/bin/nvim

[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh

# --files: List files that would be searched but do not search
# --no-ignore: Do not respect .gitignore, etc...
# --hidden: Search hidden files and folders
# --follow: Follow symlinks
# --glob: Additional conditions for search (in this case ignore everything in the .git/ folder)
export FZF_DEFAULT_COMMAND='rg --files --no-ignore --hidden --follow --glob "!.git/*"'

ZSH_AUTOSUGGEST_USE_ASYNC=true
eval $(thefuck --alias)
export ATHAME_ENABLED=0
#unset zle_bracketed_paste
