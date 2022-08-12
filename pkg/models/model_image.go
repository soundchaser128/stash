package models

import (
	"context"
	"time"

	"github.com/stashapp/stash/pkg/file"
)

// Image stores the metadata for a single image.
type Image struct {
	ID int `json:"id"`

	Title     string `json:"title"`
	Rating    *int   `json:"rating"`
	Organized bool   `json:"organized"`
	OCounter  int    `json:"o_counter"`
	StudioID  *int   `json:"studio_id"`

	// transient - not persisted
	Files []*file.ImageFile

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	GalleryIDs   RelatedIDs `json:"gallery_ids"`
	TagIDs       RelatedIDs `json:"tag_ids"`
	PerformerIDs RelatedIDs `json:"performer_ids"`
}

func (i *Image) LoadGalleryIDs(ctx context.Context, l GalleryIDLoader) error {
	return i.GalleryIDs.load(func() ([]int, error) {
		return l.GetGalleryIDs(ctx, i.ID)
	})
}

func (i *Image) LoadPerformerIDs(ctx context.Context, l PerformerIDLoader) error {
	return i.PerformerIDs.load(func() ([]int, error) {
		return l.GetPerformerIDs(ctx, i.ID)
	})
}

func (i *Image) LoadTagIDs(ctx context.Context, l TagIDLoader) error {
	return i.TagIDs.load(func() ([]int, error) {
		return l.GetTagIDs(ctx, i.ID)
	})
}

func (i Image) PrimaryFile() *file.ImageFile {
	if len(i.Files) == 0 {
		return nil
	}

	return i.Files[0]
}

func (i Image) Path() string {
	if p := i.PrimaryFile(); p != nil {
		return p.Path
	}

	return ""
}

func (i Image) Checksum() string {
	if p := i.PrimaryFile(); p != nil {
		v := p.Fingerprints.Get(file.FingerprintTypeMD5)
		if v == nil {
			return ""
		}

		return v.(string)
	}
	return ""
}

// GetTitle returns the title of the image. If the Title field is empty,
// then the base filename is returned.
func (i Image) GetTitle() string {
	if i.Title != "" {
		return i.Title
	}

	if p := i.PrimaryFile(); p != nil {
		return p.Basename
	}

	return ""
}

type ImageCreateInput struct {
	*Image
	FileIDs []file.ID
}

type ImagePartial struct {
	Title     OptionalString
	Rating    OptionalInt
	Organized OptionalBool
	OCounter  OptionalInt
	StudioID  OptionalInt
	CreatedAt OptionalTime
	UpdatedAt OptionalTime

	GalleryIDs   *UpdateIDs
	TagIDs       *UpdateIDs
	PerformerIDs *UpdateIDs
}

func NewImagePartial() ImagePartial {
	updatedTime := time.Now()
	return ImagePartial{
		UpdatedAt: NewOptionalTime(updatedTime),
	}
}

type Images []*Image

func (i *Images) Append(o interface{}) {
	*i = append(*i, o.(*Image))
}

func (i *Images) New() interface{} {
	return &Image{}
}
