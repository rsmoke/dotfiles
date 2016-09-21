Installation:

    git clone git://github.com/rsmoke/dotfiles.git ~/.vim

Create symlinks:

    ln -s ~/.vim/vimrc ~/.vimrc
    ln -s ~/.vim/gvimrc ~/.gvimrc

Switch to the `~/.vim` directory, and fetch submodules:

    cd ~/.vim
    git submodule init
    git submodule update

#### or copy paste the below script
    cd ~ && \
    git clone http://github.com/username/dotvim.git ~/.vim && \
    ln -s ~/.vim/vimrc ~/.vimrc && \
    ln -s ~/.vim/gvimrc ~/.gvimrc && \
    cd ~/.vim && \
    git submodule init && \
    git submodule update

## Upgrading a plugin bundle
    cd ~/.vim/bundle/fugitive && \
    git pull origin master

## Upgrading all bundled plugins
    git submodule foreach git pull origin master
