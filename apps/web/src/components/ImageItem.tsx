/** @jsxImportSource react */
import mixpanel from 'mixpanel-browser';
import { forwardRef, Ref, SVGProps, useCallback, useRef, useState } from 'react';
import AvatarEditor from 'react-avatar-editor';

import { OutputFormat, OutputSizingMode, Size } from '~/lib/types';
import { getImageBlobFromEditor } from '~/lib/utils';

export function TbDownload(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5l5-5m-5-7v12"
      ></path>
    </svg>
  );
}

function TbX(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M18 6L6 18M6 6l12 12"
      ></path>
    </svg>
  );
}

export function TbZoomIn(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0-14 0m4 0h6m-3-3v6m11 8l-6-6"
      ></path>
    </svg>
  );
}


type Ratio = 'square' | '3:4' | '4:3';

const ImageItem = forwardRef(
  (
    {
      file,
      outputSize,
      outputFormat,
      outputSizingMode,
      thumbnailScale,
      onDelete,
    }: {
      file: File;
      outputSize: Size;
      outputFormat: OutputFormat;
      outputSizingMode: OutputSizingMode;
      thumbnailScale: number;
      onDelete: () => void;
    },
    ref: Ref<AvatarEditor>,
  ) => {
    const editorRef = useRef<AvatarEditor | null>(null);
    const [scale, setScaleImpl] = useState(1);
    const [minScalePerc, setMinScalePerc] = useState(1);
    const [maxScalePerc, setMaxScalePerc] = useState(1);
    const [selectedRatio, setSelectedRatio] = useState<Ratio>('square');

    const setScale = useCallback((value: number) => {
      setScaleImpl(parseFloat(value.toFixed(2)));
    }, []);

    const calculateDimensions = (ratio: Ratio): Size => {
      const baseSize = Math.min(outputSize.width, outputSize.height);
      switch (ratio) {
        case 'square':
          return { width: baseSize, height: baseSize };
        case '3:4':
          return { width: baseSize * 3 / 4, height: baseSize };
        case '4:3':
          return { width: baseSize, height: baseSize * 3 / 4 };
      }
    };

    const dimensions = calculateDimensions(selectedRatio);

    return (
      <div
        className="card card-compact shadow-xl bg-base-100"
        style={{
          width: (thumbnailScale * dimensions.width).toFixed(2) + 'px',
        }}
      >
        <figure
          className="w-full"
          style={{
            height: (thumbnailScale * dimensions.height).toFixed(2) + 'px',
          }}
        >
          <div
            style={{
              scale: thumbnailScale.toFixed(2),
            }}
          >
            <AvatarEditor
              image={file}
              ref={(el) => {
                editorRef.current = el;
                if (typeof ref === 'function') {
                  ref(el);
                }
              }}
              width={dimensions.width}
              height={dimensions.height}
              border={0}
              scale={scale}
              onLoadSuccess={(image) => {
                setMinScalePerc(
                  Math.ceil((Math.min(image.width, image.height) / Math.max(image.width, image.height)) * 100),
                );
                setMaxScalePerc(
                  Math.floor(Math.min(image.resource.width / image.width, image.resource.height / image.height) * 100),
                );
              }}
            />
          </div>
        </figure>
        <div className="card-body">
          <div className="w-full flex justify-center gap-1">
            <div className="truncate">{file.name}</div>
          <button
            className="btn btn-xs btn-square"
            onClick={() => {
              onDelete();
            }}
          >
            <TbX />
          </button>
          </div>
          <div className="flex justify-center gap-2 mt-2">
            <button
              className={`btn btn-xs ${selectedRatio === 'square' ? 'btn-active' : ''}`}
              onClick={() => setSelectedRatio('square')}
            >
              1:1
            </button>
            <button
              className={`btn btn-xs ${selectedRatio === '3:4' ? 'btn-active' : ''}`}
              onClick={() => setSelectedRatio('3:4')}
            >
              3:4
            </button>
            <button
              className={`btn btn-xs ${selectedRatio === '4:3' ? 'btn-active' : ''}`}
              onClick={() => setSelectedRatio('4:3')}
            >
              4:3
            </button>
          </div>
          <div className="flex items-center gap-2">
          <div className="text-lg">
            <TbZoomIn />
          </div>
          <input
            type="range"
            min={minScalePerc}
            max={maxScalePerc}
            value={scale * 100}
            className="range range-xs flex-1"
            onChange={(e) => {
              const scale = parseFloat(e.target.value) / 100;
              if (isNaN(scale) || scale < 0) {
                setScale(1);
              } else {
                setScale(scale);
              }
            }}
          />
          <input
            type="text"
            className="input input-xs text-right w-12"
            value={(((scale * 100 - minScalePerc) / (maxScalePerc - minScalePerc)) * 100).toFixed() + '%'}
            onChange={(e) => {
              const scale = parseFloat(e.target.value.replace('%', '')) / 100;
              if (isNaN(scale) || scale < 0) {
                setScale(1);
              } else {
                setScale(scale);
              }
            }}
          />
          </div>
        </div>
      </div>
    );
  }
);

export default ImageItem;
