import Alert from '@mui/joy/Alert';
import Divider from '@mui/joy/Divider';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { DatasourceType } from '@prisma/client';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import Input from '@app/components/Input';
import { UpsertDatasourceSchema } from '@app/types/models';
import findDomainPages from '@app/utils/find-domain-pages';

import Base from './Base';
import type { DatasourceFormProps } from './types';

type Props = DatasourceFormProps & {};

export const WebSiteSourceSchema = UpsertDatasourceSchema.extend({
  config: z
    .object({
      source: z.string().trim().optional(),
      sitemap: z.string().trim().optional(),
    })
    .refine(
      (data) => {
        if (data.sitemap) {
          return !!z
            .string()
            .url()
            .parse(data.sitemap, {
              path: ['config.sitemap'],
            });
        } else if (data.source) {
          return !!z
            .string()
            .url()
            .parse(data.source, {
              path: ['config.source'],
            });
        }

        return false;
      },
      {
        message: 'You must provide either a web site URL or a sitemap URL',
        path: ['config.sitemap', 'config.source'],
      }
    ),
});

function Nested() {
  const { control, register } =
    useFormContext<z.infer<typeof WebSiteSourceSchema>>();

  return (
    <Stack gap={1}>
      <Stack gap={1}>
        <Input
          label="Web Site URL"
          helperText="e.g.: https://example.com/"
          control={control as any}
          {...register('config.source')}
        />
        <Alert color="info">
          Will automatically try to find all pages on the site during 45s max.
        </Alert>
      </Stack>

      <Typography color="primary" fontWeight={'bold'} mx={'auto'} mt={2}>
        Or
      </Typography>

      <Stack gap={1}>
        <Input
          label="Sitemap URL"
          helperText="e.g.: https://example.com/sitemap.xml"
          control={control as any}
          {...register('config.sitemap')}
        />

        <Alert color="info">
          Will process all pages in the sitemap during. 500 pages max.
        </Alert>
      </Stack>
    </Stack>
  );
}

export default function WebSiteForm(props: Props) {
  const { defaultValues, ...rest } = props;

  return (
    <Base
      schema={WebSiteSourceSchema}
      {...rest}
      defaultValues={{
        ...props.defaultValues!,
        type: DatasourceType.web_site,
      }}
    >
      <Nested />
    </Base>
  );
}
