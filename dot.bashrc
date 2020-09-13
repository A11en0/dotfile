#!/bin/bash

# ~/.bashrc: executed by bash(1) for non-login shells.
# see /usr/share/doc/bash/examples/startup-files for examples

[ -f /etc/bash.bashrc ] && source /etc/bash.bashrc
[ -f ~/.bash_aliases ] && . ~/.bash_aliases
[ -f ~/.bin/bashmarks.sh ] && . ~/.bin/bashmarks.sh
[ -f ~/.bin/bash_completion_tmux.sh ] && . ~/.bin/bash_completion_tmux.sh
[ -f ~/.bin/git-prompt.sh ] && . ~/.bin/git-prompt.sh
test -f ~/.bin/utils && . ~/.bin/utils
test -f ~/.bin/web-apps && . ~/.bin/web-apps
test -f ~/.bin/docs.sh && . ~/.bin/docs.sh

eval "$(lesspipe)"

## add git info
PS1='${debian_chroot:+($debian_chroot)}\[\e[0;36m\]\w$(__git_ps1 "(%s)")\$\[\e[0m\] '

if [ -f ~/.lscolors ]; then 
	eval "$(tty -s && dircolors ~/.lscolors)"
else 
	eval "$(dircolors)"
fi

export PROMPT_DIRTRIM=1
export HISTIGNORE="&:[ ]*:exit"
export HISTFILESIZE=2000
export HISTSIZE=2000
#export BROWSER='/usr/bin/x-www-browser'
export EDITOR='vim'
export ALTERNATE_EDITOR="vim"
export PDFVIEWER='/usr/bin/zathura'
export LESSCHARSET=utf-8
#export IGNOREEOF=2
#export TESSDATA_PREFIX='/usr/local/share/tesseract-ocr/4.00'
tabs -4 &>/dev/null

export PATH="/home/allen/.cask/bin:$PATH"                     
export PATH="/home/allen/Softwares/pycharm-2020.2.1/bin:$PATH"

export JAVA_HOME=/usr/lib/jvm/jdk8
export JRE_HOME=${JAVA_HOME}/jre
export CLASSPATH=.:${JAVA_HOME}/lib:${JRE_HOME}/lib
export PATH=${JAVA_HOME}/bin:$PATH

# Use colors for less, man, etc.
[[ -f ~/.LESS_TERMCAP ]] && tty -s && . ~/.LESS_TERMCAP

#source ~/.xsh
export GPGKEY=0EE277C8D838C7DA
# added by Anaconda3 5.3.1 installer
# >>> conda init >>>
# !! Contents within this block are managed by 'conda init' !!
__conda_setup="$(CONDA_REPORT_ERRORS=false '/home/allen/.anaconda3/bin/conda' shell.bash hook 2> /dev/null)"
if [ $? -eq 0 ]; then
    \eval "$__conda_setup"
else
    if [ -f "/home/allen/.anaconda3/etc/profile.d/conda.sh" ]; then
        . "/home/allen/.anaconda3/etc/profile.d/conda.sh"
        CONDA_CHANGEPS1=false conda activate base
    else
        \export PATH="/home/allen/.anaconda3/bin:$PATH"
    fi
fi
unset __conda_setup
# <<< conda init <<<
