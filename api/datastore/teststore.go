package datastore

import (
	"io/ioutil"
	"log"
	"os"

	portainer "github.com/portainer/portainer/api"
	"github.com/portainer/portainer/api/database"

	"github.com/pkg/errors"
	"github.com/portainer/portainer/api/filesystem"
)

var errTempDir = errors.New("can't create a temp dir")

func (store *Store) GetConnection() portainer.Connection {
	return store.connection
}

func MustNewTestStore(init bool) (bool, *Store, func()) {
	newStore, store, teardown, err := NewTestStore(init)
	if err != nil {
		if !errors.Is(err, errTempDir) {
			teardown()
		}
		log.Fatal(err)
	}

	return newStore, store, teardown
}

func NewTestStore(init bool) (bool, *Store, func(), error) {
	// Creates unique temp directory in a concurrency friendly manner.
	storePath, err := ioutil.TempDir("", "test-store")
	if err != nil {
		return false, nil, nil, errors.Wrap(errTempDir, err.Error())
	}

	fileService, err := filesystem.NewService(storePath, "")
	if err != nil {
		return false, nil, nil, err
	}

	// TODO: add the UX to get the key from somewhere we consider "safe"
	connection, err := database.NewDatabase("boltdb", storePath, "apassphrasewhichneedstobe32bytes")
	if err != nil {
		panic(err)
	}
	store := NewStore(storePath, fileService, connection)
	isNewStore, err := store.Open()
	if err != nil {
		return isNewStore, nil, nil, err
	}

	if init {
		err = store.Init()
		if err != nil {
			return isNewStore, nil, nil, err
		}
	}

	if isNewStore {
		// from MigrateData
		store.VersionService.StoreDBVersion(portainer.DBVersion)
		if err != nil {
			return isNewStore, nil, nil, err
		}
	}

	teardown := func() {
		teardown(store, storePath)
	}

	return isNewStore, store, teardown, nil
}

func teardown(store *Store, storePath string) {
	err := store.Close()
	if err != nil {
		log.Fatalln(err)
	}

	err = os.RemoveAll(storePath)
	if err != nil {
		log.Fatalln(err)
	}
}
